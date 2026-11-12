import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { randomBytes } from 'crypto';
import helmet, { type HelmetOptions } from 'helmet';
import type { INestApplication } from '@nestjs/common';
import type { IncomingMessage, ServerResponse } from 'http';

import { AppNameEnum } from '@acme-libs/kernel';

export class ApiReference {
  private static readonly DOCUMENTS: Record<AppNameEnum, { title: string; description: string }> = {
    [AppNameEnum.STAFF_APP]: {
      title: 'ACME staff API',
      description:
        'The back-office surface: identity administration, the product catalog, the audit log, and the notes and reminders of each staff user.',
    },
    [AppNameEnum.CUSTOMER_APP]: {
      title: 'ACME customer API',
      description: 'The customer-facing surface: sign-up and sign-in.',
    },
    [AppNameEnum.PROCESSOR_APP]: {
      title: 'ACME processor app',
      description:
        'The background worker: health probes only; its work comes from queues and schedules.',
    },
  };
  private static readonly SCRIPT_HOST = 'https://cdn.jsdelivr.net';
  private static readonly FONT_HOST = 'https://fonts.scalar.com';

  public static setup(app: INestApplication, appName: AppNameEnum): void {
    const config = app.get(ConfigService);

    if (!config.getOrThrow<boolean>('API_USE_API_REFERENCE')) {
      return;
    }

    const prefix = config.getOrThrow<string>('API_PREFIX');
    const { title, description } = ApiReference.DOCUMENTS[appName];
    const options = new DocumentBuilder()
      .setTitle(title)
      .setDescription(description)
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, options);
    const nonces = new WeakMap<ServerResponse, string>();
    const assignNonce = (_req: IncomingMessage, res: ServerResponse, next: () => void): void => {
      nonces.set(res, randomBytes(16).toString('base64'));
      next();
    };
    const helmetOptions = ApiReference.helmetOptions(nonces);
    const headers = helmet(helmetOptions);
    const render = (req: IncomingMessage, res: ServerResponse): void => {
      const nonce = nonces.get(res);
      const reference = apiReference({ content: document, nonce });

      reference(req, res);
    };

    app.use(`/${prefix}/reference`, assignNonce, headers, render);
  }

  private static helmetOptions(nonces: WeakMap<ServerResponse, string>): HelmetOptions {
    const nonce = (_req: IncomingMessage, res: ServerResponse): string =>
      `'nonce-${nonces.get(res)}'`;

    return {
      contentSecurityPolicy: {
        useDefaults: false,
        directives: {
          defaultSrc: ["'none'"],
          scriptSrc: ["'self'", ApiReference.SCRIPT_HOST, nonce],
          styleSrc: ["'self'", "'unsafe-inline'"],
          fontSrc: ["'self'", ApiReference.FONT_HOST],
          imgSrc: ["'self'", 'data:'],
          connectSrc: ["'self'"],
          baseUri: ["'none'"],
          formAction: ["'none'"],
          frameAncestors: ["'none'"],
        },
      },
      frameguard: { action: 'deny' },
    };
  }
}
