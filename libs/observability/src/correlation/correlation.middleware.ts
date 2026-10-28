import { Injectable, NestMiddleware } from '@nestjs/common';
import { IncomingMessage, ServerResponse } from 'http';

import { correlationStorage } from './correlation.storage';
import { CorrelationIdHelper } from './correlation-id.helper';

@Injectable()
export class CorrelationMiddleware implements NestMiddleware {
  public use(req: IncomingMessage, res: ServerResponse, next: () => void): void {
    const correlationId = CorrelationIdHelper.resolve(req, res);

    correlationStorage.run(correlationId, next);
  }
}
