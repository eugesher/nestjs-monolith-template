import { randomUUID } from 'crypto';
import { IncomingMessage, ServerResponse } from 'http';

import { CORRELATION_ID_HEADER } from './correlation-id-header.const';

export class CorrelationIdHelper {
  public static resolve(req: IncomingMessage, res: ServerResponse): string {
    const inbound = req.headers[CORRELATION_ID_HEADER];
    const first = Array.isArray(inbound) ? inbound[0] : inbound;
    const correlationId = first === undefined || first === '' ? randomUUID() : first;

    req.headers[CORRELATION_ID_HEADER] = correlationId;

    if (!res.headersSent) {
      res.setHeader(CORRELATION_ID_HEADER, correlationId);
    }

    return correlationId;
  }
}
