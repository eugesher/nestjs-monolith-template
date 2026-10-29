import { Inject, Injectable } from '@nestjs/common';

import {
  CUSTOMER_IDENTITY_CORE_AUTH_PORT,
  type ICustomerIdentityCoreAuthPort,
} from '@acme-core/contracts/customer-identity';
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
export class AuthCustomerIdentityCoreAdapter implements IAuthIdentityPort {
  constructor(
    @Inject(CUSTOMER_IDENTITY_CORE_AUTH_PORT)
    private readonly identity: ICustomerIdentityCoreAuthPort,
  ) {}

  public async register(command: IAuthIdentityRegisterCommand): Promise<IAuthIdentityRegisterView> {
    const { email, password } = command;

    try {
      return await this.identity.register({ email, password });
    } catch (error) {
      throw AuthCustomerIdentityCoreAdapter.translate(error);
    }
  }

  public async login(command: IAuthIdentityLoginCommand): Promise<IAuthIdentityAccessTokenView> {
    const { email, password } = command;

    try {
      return await this.identity.login({ email, password });
    } catch (error) {
      throw AuthCustomerIdentityCoreAdapter.translate(error);
    }
  }

  private static translate(error: unknown): unknown {
    if (
      error instanceof DomainException &&
      AuthCustomerIdentityCoreAdapter.isIdentityCode(error.code)
    ) {
      return new AuthDomainException(error.code, error.message);
    }

    return error;
  }

  private static isIdentityCode(code: string): code is IdentityErrorCodeEnum {
    return Object.values<string>(IdentityErrorCodeEnum).includes(code);
  }
}
