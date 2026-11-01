import { IncomingMessage, ServerResponse } from 'http';
import { CLS_ID, ClsMiddlewareOptions, ClsModuleOptions, ClsService } from 'nestjs-cls';

import { CorrelationIdHelper } from './correlation-id.helper';

export class CorrelationSetupConfig implements ClsModuleOptions {
  public readonly global = true;
  public readonly middleware: ClsMiddlewareOptions;

  constructor() {
    this.middleware = {
      mount: true,
      setup: (cls: ClsService, req: IncomingMessage, res: ServerResponse) => {
        const correlationId = CorrelationIdHelper.resolve(req, res);

        cls.set(CLS_ID, correlationId);
      },
    };
  }
}
