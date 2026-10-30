import { Injectable } from '@nestjs/common';

import {
  ICustomerIdentityCommonAccessTokenView,
  ICustomerIdentityCommonLoginCommand,
  ICustomerIdentityCommonRegisterCommand,
  ICustomerIdentityCommonRegisterView,
  ICustomerIdentityCommonAuthPort,
  ICustomerIdentityCommonSubjectView,
  ICustomerIdentityCommonValidateSubjectQuery,
} from '@acme-customer-contracts/customer-identity';
import { Maybe } from '@acme-libs/toolkit';
import {
  CustomerIdentityCommonLoginUseCase,
  CustomerIdentityCommonRegisterUseCase,
  CustomerIdentityCommonValidateSubjectUseCase,
} from '../application';

@Injectable()
export class CustomerIdentityCommonAuthFacade implements ICustomerIdentityCommonAuthPort {
  constructor(
    private readonly identityCoreLogin: CustomerIdentityCommonLoginUseCase,
    private readonly identityCoreRegister: CustomerIdentityCommonRegisterUseCase,
    private readonly identityCoreValidateSubject: CustomerIdentityCommonValidateSubjectUseCase,
  ) {}

  public register(
    command: ICustomerIdentityCommonRegisterCommand,
  ): Promise<ICustomerIdentityCommonRegisterView> {
    return this.identityCoreRegister.execute(command);
  }

  public login(
    command: ICustomerIdentityCommonLoginCommand,
  ): Promise<ICustomerIdentityCommonAccessTokenView> {
    return this.identityCoreLogin.execute(command);
  }

  public validateSubject(
    query: ICustomerIdentityCommonValidateSubjectQuery,
  ): Promise<Maybe<ICustomerIdentityCommonSubjectView>> {
    return this.identityCoreValidateSubject.execute(query);
  }
}
