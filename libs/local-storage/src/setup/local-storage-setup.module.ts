import { CLS_ID, ClsModule, type ClsModuleOptions, type ClsService } from 'nestjs-cls';
import type { DynamicModule } from '@nestjs/common';
import type { IncomingMessage, ServerResponse } from 'http';

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
