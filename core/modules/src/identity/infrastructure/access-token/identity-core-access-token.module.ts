import { DynamicModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

export class IdentityCoreAccessTokenModule {
  public static register(): DynamicModule {
    return JwtModule.register({});
  }
}
