import { Module } from '@nestjs/common';

import { CUSTOMER_IDENTITY_CORE_AUTH_PORT } from '@acme-core/contracts/customer-identity';
import { CredentialsLibModule } from '@acme-libs/credentials';
import {
  CustomerIdentityCoreAccessTokenService,
  CustomerIdentityCoreLoginUseCase,
  CustomerIdentityCoreRegisterUseCase,
  CustomerIdentityCoreValidateSubjectUseCase,
} from '../application';
import {
  CustomerIdentityCoreLoginRepository,
  CustomerIdentityCoreRegisterRepository,
  CustomerIdentityCoreTypeOrmModule,
  CustomerIdentityCoreValidateSubjectRepository,
} from '../infrastructure';
import {
  CUSTOMER_IDENTITY_CORE_LOGIN_REPOSITORY_PORT,
  CUSTOMER_IDENTITY_CORE_REGISTER_REPOSITORY_PORT,
  CUSTOMER_IDENTITY_CORE_VALIDATE_SUBJECT_REPOSITORY_PORT,
} from '../outbound';
import { CustomerIdentityCoreAuthFacade } from './customer-identity-core-auth.facade';

@Module({
  imports: [CustomerIdentityCoreTypeOrmModule.forFeature(), CredentialsLibModule],
  exports: [CUSTOMER_IDENTITY_CORE_AUTH_PORT],
  providers: [
    { provide: CUSTOMER_IDENTITY_CORE_AUTH_PORT, useClass: CustomerIdentityCoreAuthFacade },
    CustomerIdentityCoreLoginUseCase,
    CustomerIdentityCoreRegisterUseCase,
    CustomerIdentityCoreValidateSubjectUseCase,
    CustomerIdentityCoreAccessTokenService,
    {
      provide: CUSTOMER_IDENTITY_CORE_LOGIN_REPOSITORY_PORT,
      useClass: CustomerIdentityCoreLoginRepository,
    },
    {
      provide: CUSTOMER_IDENTITY_CORE_REGISTER_REPOSITORY_PORT,
      useClass: CustomerIdentityCoreRegisterRepository,
    },
    {
      provide: CUSTOMER_IDENTITY_CORE_VALIDATE_SUBJECT_REPOSITORY_PORT,
      useClass: CustomerIdentityCoreValidateSubjectRepository,
    },
  ],
})
export class CustomerIdentityCoreModule {}
