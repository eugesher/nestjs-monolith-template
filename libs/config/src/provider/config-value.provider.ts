import { FactoryProvider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { IConfigValueProperties } from './interfaces/config-value-properties.interface';
import { IConfigValueProvideOptions } from './interfaces/config-value.interface';

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
