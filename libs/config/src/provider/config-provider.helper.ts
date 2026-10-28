import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export class ConfigProviderHelper {
  public static value(token: symbol, key: string): Provider {
    return {
      provide: token,
      inject: [ConfigService],
      useFactory: (config: ConfigService): unknown => config.getOrThrow(key),
    };
  }
}
