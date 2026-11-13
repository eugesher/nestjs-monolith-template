import { Controller, Get, Global, Module, type INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { HttpSecurityModule } from '../http-security.module';

describe('HttpSecurityModule', () => {
  let app: INestApplication;

  const createApp = async (origins: string): Promise<string> => {
    @Global()
    @Module({
      exports: [ConfigService],
      providers: [
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: (key: string) => ({ HTTP_CORS_ORIGINS: origins })[key],
          },
        },
      ],
    })
    class ConfigStubModule {}

    @Controller()
    class FixtureController {
      @Get('orders')
      public handleOrders(): { id: number } {
        return { id: 1 };
      }
    }

    @Module({
      imports: [ConfigStubModule, HttpSecurityModule.forRoot()],
      controllers: [FixtureController],
    })
    class TestModule {}

    app = await NestFactory.create(TestModule, { logger: false });
    await app.listen(0, '127.0.0.1');

    return await app.getUrl();
  };

  afterEach(async () => {
    await app.close();
  });

  it('sets the security headers of helmet with a CSP that allows nothing', async () => {
    const url = await createApp('');

    const response = await fetch(`${url}/orders`);

    expect({
      status: response.status,
      csp: response.headers.get('content-security-policy'),
      hsts: response.headers.get('strict-transport-security'),
      noSniff: response.headers.get('x-content-type-options'),
      frame: response.headers.get('x-frame-options'),
      poweredBy: response.headers.get('x-powered-by'),
    }).toEqual({
      status: 200,
      csp: "default-src 'none';frame-ancestors 'none'",
      hsts: 'max-age=31536000; includeSubDomains',
      noSniff: 'nosniff',
      frame: 'DENY',
      poweredBy: null,
    });
  });

  it('answers no CORS headers when HTTP_CORS_ORIGINS is empty', async () => {
    const url = await createApp('');

    const preflight = await fetch(`${url}/orders`, {
      method: 'OPTIONS',
      headers: { origin: 'https://app.example.test', 'access-control-request-method': 'GET' },
    });
    const response = await fetch(`${url}/orders`, {
      headers: { origin: 'https://app.example.test' },
    });

    expect({
      preflight: {
        status: preflight.status,
        origin: preflight.headers.get('access-control-allow-origin'),
      },
      response: { origin: response.headers.get('access-control-allow-origin') },
    }).toEqual({ preflight: { status: 404, origin: null }, response: { origin: null } });
  });

  it('allows the origins of HTTP_CORS_ORIGINS and exposes the correlation and retry headers', async () => {
    const url = await createApp('https://app.example.test,https://admin.example.test');

    const preflight = await fetch(`${url}/orders`, {
      method: 'OPTIONS',
      headers: { origin: 'https://admin.example.test', 'access-control-request-method': 'GET' },
    });
    const response = await fetch(`${url}/orders`, {
      headers: { origin: 'https://app.example.test' },
    });

    expect({
      preflight: {
        status: preflight.status,
        origin: preflight.headers.get('access-control-allow-origin'),
        methods: preflight.headers.get('access-control-allow-methods'),
      },
      response: {
        origin: response.headers.get('access-control-allow-origin'),
        exposed: response.headers.get('access-control-expose-headers'),
        vary: response.headers.get('vary'),
      },
    }).toEqual({
      preflight: {
        status: 204,
        origin: 'https://admin.example.test',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      },
      response: {
        origin: 'https://app.example.test',
        exposed: 'x-correlation-id,Retry-After,Retry-After-auth',
        vary: 'Origin',
      },
    });
  });

  it('answers no allowed origin to an origin outside HTTP_CORS_ORIGINS', async () => {
    const url = await createApp('https://app.example.test');

    const preflight = await fetch(`${url}/orders`, {
      method: 'OPTIONS',
      headers: { origin: 'https://evil.example.test', 'access-control-request-method': 'GET' },
    });

    expect({
      status: preflight.status,
      origin: preflight.headers.get('access-control-allow-origin'),
    }).toEqual({ status: 204, origin: null });
  });
});
