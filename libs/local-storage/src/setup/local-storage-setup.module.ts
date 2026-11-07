import { DynamicModule } from '@nestjs/common';
import { IncomingMessage, ServerResponse } from 'http';
import { CLS_ID, ClsModule, ClsModuleOptions, ClsService } from 'nestjs-cls';

import { CorrelationIdHelper } from '@acme-libs/observability';

export class LocalStorageSetupModule {
  public static forRoot(): DynamicModule {
    const options = LocalStorageSetupModule.options();

    return ClsModule.forRoot(options);
  }

  private static options(): ClsModuleOptions {
    return {
      global: true,
      middleware: {
        mount: true,
        setup: (cls: ClsService, req: IncomingMessage, res: ServerResponse) => {
          const correlationId = CorrelationIdHelper.resolve(req, res);

          cls.set(CLS_ID, correlationId);
        },
      },
    };
  }
}
