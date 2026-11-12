import { randomUUID } from 'crypto';
import type { IncomingMessage, ServerResponse } from 'http';

import type { Maybe } from '@acme-libs/toolkit';

import { CORRELATION_ID_HEADER } from './correlation-id-header.const';

export class CorrelationIdHelper {
  private static readonly UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  public static resolve(req: IncomingMessage, res: ServerResponse): string {
    const inbound = req.headers[CORRELATION_ID_HEADER];
    const first = Array.isArray(inbound) ? inbound[0] : inbound;
    const correlationId = CorrelationIdHelper.fromInbound(first);

    req.headers[CORRELATION_ID_HEADER] = correlationId;

    if (!res.headersSent) {
      res.setHeader(CORRELATION_ID_HEADER, correlationId);
    }

    return correlationId;
  }

  public static fromInbound(inbound: Maybe<string>): string {
    const isUuid = inbound !== undefined && CorrelationIdHelper.UUID_PATTERN.test(inbound);

    return isUuid ? inbound : randomUUID();
  }
}
