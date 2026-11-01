import { DynamicModule } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';

import { CorrelationSetupConfig } from './correlation-setup.config';

export class CorrelationSetupModule {
  public static forRoot(): DynamicModule {
    const config = new CorrelationSetupConfig();

    return ClsModule.forRoot(config);
  }
}
