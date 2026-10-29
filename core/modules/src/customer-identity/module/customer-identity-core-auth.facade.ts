import { Injectable } from '@nestjs/common';

import {
  ICustomerIdentityCoreAccessTokenView,
  ICustomerIdentityCoreLoginCommand,
  ICustomerIdentityCoreRegisterCommand,
  ICustomerIdentityCoreRegisterView,
  ICustomerIdentityCoreAuthPort,
  ICustomerIdentityCoreSubjectView,
  ICustomerIdentityCoreValidateSubjectQuery,
} from '@acme-core/contracts/customer-identity';
import { Maybe } from '@acme-libs/toolkit';
import {
  CustomerIdentityCoreLoginUseCase,
  CustomerIdentityCoreRegisterUseCase,
  CustomerIdentityCoreValidateSubjectUseCase,
} from '../application';

@Injectable()
export class CustomerIdentityCoreAuthFacade implements ICustomerIdentityCoreAuthPort {
  constructor(
    private readonly identityCoreLogin: CustomerIdentityCoreLoginUseCase,
    private readonly identityCoreRegister: CustomerIdentityCoreRegisterUseCase,
    private readonly identityCoreValidateSubject: CustomerIdentityCoreValidateSubjectUseCase,
  ) {}

  public register(
    command: ICustomerIdentityCoreRegisterCommand,
  ): Promise<ICustomerIdentityCoreRegisterView> {
    return this.identityCoreRegister.execute(command);
  }

  public login(
    command: ICustomerIdentityCoreLoginCommand,
  ): Promise<ICustomerIdentityCoreAccessTokenView> {
    return this.identityCoreLogin.execute(command);
  }

  public validateSubject(
    query: ICustomerIdentityCoreValidateSubjectQuery,
  ): Promise<Maybe<ICustomerIdentityCoreSubjectView>> {
    return this.identityCoreValidateSubject.execute(query);
  }
}
