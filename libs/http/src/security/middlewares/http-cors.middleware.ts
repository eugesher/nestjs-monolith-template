import { Injectable, type NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cors from 'cors';
import type { IncomingMessage, ServerResponse } from 'http';

import { CORRELATION_ID_HEADER } from '@acme-libs/observability';

@Injectable()
export class HttpCorsMiddleware implements NestMiddleware {
  private static readonly EXPOSED_HEADERS = [
    CORRELATION_ID_HEADER,
    'Retry-After',
    'Retry-After-auth',
  ];

  private readonly handler: ReturnType<typeof cors>;

  constructor(config: ConfigService) {
    const originsValue = config.getOrThrow<string>('HTTP_CORS_ORIGINS');
    const origins = originsValue.split(',').filter((origin) => origin !== '');
    const origin = origins.length > 0 ? origins : false;

    this.handler = cors({ origin, exposedHeaders: HttpCorsMiddleware.EXPOSED_HEADERS });
  }

  public use(req: IncomingMessage, res: ServerResponse, next: (error?: unknown) => void): void {
    this.handler(req, res, next);
  }
}
