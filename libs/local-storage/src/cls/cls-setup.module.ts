import { DynamicModule } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';

import { ClsSetupConfig } from './cls-setup.config';

export class ClsSetupModule {
  public static forRoot(): DynamicModule {
    const config = new ClsSetupConfig();

    return ClsModule.forRoot(config);
  }
}
