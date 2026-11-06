import { FactoryProvider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { IConfigValueProvideOptions } from './interfaces/config-value.interface';

export class ConfigValueProvider {
  public static provide(options: IConfigValueProvideOptions): FactoryProvider<unknown> {
    const { provide, property } = options;

    return {
      provide,
      inject: [ConfigService],
      useFactory: (config: ConfigService): unknown => config.getOrThrow(property),
    };
  }
}
