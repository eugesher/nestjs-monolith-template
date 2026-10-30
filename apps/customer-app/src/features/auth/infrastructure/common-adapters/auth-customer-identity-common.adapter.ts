import { Inject, Injectable } from '@nestjs/common';

import {
  CUSTOMER_IDENTITY_COMMON_AUTH_PORT,
  type ICustomerIdentityCommonAuthPort,
} from '@acme-customer-contracts/customer-identity';
import { IdentityErrorCodeEnum } from '@acme-libs/kernel';
import { DomainException } from '@acme-libs/toolkit';
import { AuthDomainException } from '../../domain';
import {
  IAuthIdentityAccessTokenView,
  IAuthIdentityLoginCommand,
  IAuthIdentityPort,
  IAuthIdentityRegisterCommand,
  IAuthIdentityRegisterView,
} from '../../outbound';

@Injectable()
export class AuthCustomerIdentityCommonAdapter implements IAuthIdentityPort {
  constructor(
    @Inject(CUSTOMER_IDENTITY_COMMON_AUTH_PORT)
    private readonly identity: ICustomerIdentityCommonAuthPort,
  ) {}

  public async register(command: IAuthIdentityRegisterCommand): Promise<IAuthIdentityRegisterView> {
    const { email, password } = command;

    try {
      return await this.identity.register({ email, password });
    } catch (error) {
      throw AuthCustomerIdentityCommonAdapter.translate(error);
    }
  }

  public async login(command: IAuthIdentityLoginCommand): Promise<IAuthIdentityAccessTokenView> {
    const { email, password } = command;

    try {
      return await this.identity.login({ email, password });
    } catch (error) {
      throw AuthCustomerIdentityCommonAdapter.translate(error);
    }
  }

  private static translate(error: unknown): unknown {
    if (
      error instanceof DomainException &&
      AuthCustomerIdentityCommonAdapter.isIdentityCode(error.code)
    ) {
      return new AuthDomainException(error.code, error.message);
    }

    return error;
  }

  private static isIdentityCode(code: string): code is IdentityErrorCodeEnum {
    return Object.values<string>(IdentityErrorCodeEnum).includes(code);
  }
}
