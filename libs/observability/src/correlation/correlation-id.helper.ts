import { randomUUID } from 'crypto';
import { PinoLogger } from 'nestjs-pino';
import type { IncomingMessage, ServerResponse } from 'http';

import type { Maybe } from '@acme-libs/toolkit';

import { CORRELATION_ID_HEADER } from './correlation-id-header.const';

export class CorrelationIdHelper {
  private static readonly UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  public static resolve(req: IncomingMessage, res: ServerResponse): string {
    const inbound = req.headers[CORRELATION_ID_HEADER];
    const inboundValue = Array.isArray(inbound) ? inbound[0] : inbound;
    const correlationId = CorrelationIdHelper.fromInbound(inboundValue);

    req.headers[CORRELATION_ID_HEADER] = correlationId;

    if (!res.headersSent) {
      res.setHeader(CORRELATION_ID_HEADER, correlationId);
    }

    return correlationId;
  }

  public static fromInbound(inbound: Maybe<string>): string {
    if (inbound === undefined || inbound === '') {
      return randomUUID();
    }

    if (CorrelationIdHelper.UUID_PATTERN.test(inbound)) {
      return inbound;
    }

    const mintedId = randomUUID();

    (PinoLogger.root as Maybe<typeof PinoLogger.root>)?.warn(
      { correlationId: mintedId, inboundLength: inbound.length },
      'Invalid inbound correlationId: not a UUID, a new correlationId is minted',
    );

    return mintedId;
  }
}
