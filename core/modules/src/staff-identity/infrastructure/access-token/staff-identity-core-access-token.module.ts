import { DynamicModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

export class StaffIdentityCoreAccessTokenModule {
  public static register(): DynamicModule {
    return JwtModule.register({});
  }
}
