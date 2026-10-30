import { Module } from '@nestjs/common';

import { CUSTOMER_IDENTITY_COMMON_AUTH_PORT } from '@acme-customer-contracts/customer-identity';
import { CredentialsLibModule } from '@acme-libs/credentials';
import {
  CustomerIdentityCommonAccessTokenService,
  CustomerIdentityCommonLoginUseCase,
  CustomerIdentityCommonRegisterUseCase,
  CustomerIdentityCommonValidateSubjectUseCase,
} from '../application';
import {
  CustomerIdentityCommonLoginRepository,
  CustomerIdentityCommonRegisterRepository,
  CustomerIdentityCommonTypeOrmModule,
  CustomerIdentityCommonValidateSubjectRepository,
} from '../infrastructure';
import {
  CUSTOMER_IDENTITY_COMMON_LOGIN_REPOSITORY_PORT,
  CUSTOMER_IDENTITY_COMMON_REGISTER_REPOSITORY_PORT,
  CUSTOMER_IDENTITY_COMMON_VALIDATE_SUBJECT_REPOSITORY_PORT,
} from '../outbound';
import { CustomerIdentityCommonAuthFacade } from './customer-identity-common-auth.facade';

@Module({
  imports: [CustomerIdentityCommonTypeOrmModule.forFeature(), CredentialsLibModule],
  exports: [CUSTOMER_IDENTITY_COMMON_AUTH_PORT],
  providers: [
    { provide: CUSTOMER_IDENTITY_COMMON_AUTH_PORT, useClass: CustomerIdentityCommonAuthFacade },
    CustomerIdentityCommonLoginUseCase,
    CustomerIdentityCommonRegisterUseCase,
    CustomerIdentityCommonValidateSubjectUseCase,
    CustomerIdentityCommonAccessTokenService,
    {
      provide: CUSTOMER_IDENTITY_COMMON_LOGIN_REPOSITORY_PORT,
      useClass: CustomerIdentityCommonLoginRepository,
    },
    {
      provide: CUSTOMER_IDENTITY_COMMON_REGISTER_REPOSITORY_PORT,
      useClass: CustomerIdentityCommonRegisterRepository,
    },
    {
      provide: CUSTOMER_IDENTITY_COMMON_VALIDATE_SUBJECT_REPOSITORY_PORT,
      useClass: CustomerIdentityCommonValidateSubjectRepository,
    },
  ],
})
export class CustomerIdentityCommonModule {}
