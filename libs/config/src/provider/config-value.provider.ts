import { ConfigService } from '@nestjs/config';
import type { FactoryProvider } from '@nestjs/common';

import type { IConfigValueProperties } from './interfaces/config-value-properties.interface';
import type { IConfigValueProvideOptions } from './interfaces/config-value-provide.options';

export class ConfigValueProvider {
  public static provide<Property extends keyof IConfigValueProperties>(
    options: IConfigValueProvideOptions<Property>,
  ): FactoryProvider<IConfigValueProperties[Property]> {
    const { injectionToken, configProperty } = options;

    return {
      provide: injectionToken,
      inject: [ConfigService],
      useFactory: (config: ConfigService): IConfigValueProperties[Property] =>
        config.getOrThrow<IConfigValueProperties[Property]>(configProperty),
    };
  }
}
