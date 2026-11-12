import { HttpStatus } from '@nestjs/common';
import request from 'supertest';

import type { AppE2EContext } from '../../context/app-e2e.context';

export class HealthE2E {
  private constructor(private readonly ctx: AppE2EContext) {}

  public static of(ctx: AppE2EContext): HealthE2E {
    return new HealthE2E(ctx);
  }

  public live(): void {
    describe('GET /api/health', () => {
      it('should report liveness and mint a correlation id', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/health')
          .expect(HttpStatus.OK);

        expect({ response: { body: response.body } }).toMatchSnapshot({
          response: { body: { uptimeSeconds: expect.any(Number) } },
        });
        expect(response.headers['x-correlation-id']).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
        );
      });

      it('should echo an inbound correlation id', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/health')
          .set('x-correlation-id', 'e2e00000-0000-4000-8000-000000000001')
          .expect(HttpStatus.OK);

        expect(response.headers['x-correlation-id']).toEqual(
          'e2e00000-0000-4000-8000-000000000001',
        );
      });

      it('should replace an inbound correlation id that is not a UUID and warn on the root logger', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/health')
          .set('x-correlation-id', 'e2e-correlation-id')
          .expect(HttpStatus.OK);

        expect(response.headers['x-correlation-id']).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
        );
        expect(this.ctx.takeRootWarnings()).toEqual([
          [
            { correlationId: response.headers['x-correlation-id'], inboundLength: 18 },
            'Invalid inbound correlationId: not a UUID, a new correlationId is minted',
          ],
        ]);
      });
      it('should set the security headers of helmet', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/health')
          .expect(HttpStatus.OK);

        expect({
          headers: {
            'content-security-policy': response.headers['content-security-policy'],
            'strict-transport-security': response.headers['strict-transport-security'],
            'x-content-type-options': response.headers['x-content-type-options'],
            'x-frame-options': response.headers['x-frame-options'],
            'x-powered-by': response.headers['x-powered-by'],
          },
        }).toMatchSnapshot();
      });

      it('should answer the preflight of an origin of HTTP_CORS_ORIGINS', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .options('/api/health')
          .set('origin', 'https://app.example.test')
          .set('access-control-request-method', 'GET')
          .expect(HttpStatus.NO_CONTENT);

        expect({
          headers: {
            'access-control-allow-origin': response.headers['access-control-allow-origin'],
            'access-control-allow-methods': response.headers['access-control-allow-methods'],
            'access-control-expose-headers': response.headers['access-control-expose-headers'],
          },
        }).toMatchSnapshot();
      });

      it('should not allow an origin outside HTTP_CORS_ORIGINS', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/health')
          .set('origin', 'https://evil.example.test')
          .expect(HttpStatus.OK);

        expect(response.headers['access-control-allow-origin']).toBeUndefined();
      });
    });
  }

  public ready(): void {
    describe('GET /api/health/ready', () => {
      it('should report readiness of the database and the cache', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/health/ready')
          .expect(HttpStatus.OK);

        expect({ response: { body: response.body } }).toMatchSnapshot({
          response: {
            body: {
              dependencies: {
                database: { latencyMs: expect.any(Number) },
                cache: { latencyMs: expect.any(Number) },
              },
            },
          },
        });
      });
    });
  }
}
