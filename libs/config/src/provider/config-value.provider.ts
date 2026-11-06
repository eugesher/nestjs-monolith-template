import { FactoryProvider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { IConfigValueProvideOptions } from './interfaces/config-value.interface';

export class ConfigValueProvider {
  public static provide<T = unknown>(options: IConfigValueProvideOptions): FactoryProvider<T> {
    const { injectionToken, configProperty } = options;

    return {
      provide: injectionToken,
      inject: [ConfigService],
      useFactory: (config: ConfigService): T => config.getOrThrow<T>(configProperty),
    };
  }
}
