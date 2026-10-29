import { Inject, Injectable } from '@nestjs/common';

import {
  CUSTOMER_IDENTITY_CORE_SESSION_PORT,
  type ICustomerIdentityCoreSessionPort,
} from '@acme-core/contracts/customer-identity';
import { IdentityErrorCodeEnum } from '@acme-libs/kernel';
import { DomainException } from '@acme-libs/toolkit';
import { SessionDomainException } from '../../domain';
import {
  ISessionIdentityAccessTokenView,
  ISessionIdentityLoginCommand,
  ISessionIdentityPort,
  ISessionIdentityRegisterCommand,
  ISessionIdentityRegisterView,
} from '../../outbound';

@Injectable()
export class SessionCustomerIdentityCoreAdapter implements ISessionIdentityPort {
  constructor(
    @Inject(CUSTOMER_IDENTITY_CORE_SESSION_PORT)
    private readonly identity: ICustomerIdentityCoreSessionPort,
  ) {}

  public async register(
    command: ISessionIdentityRegisterCommand,
  ): Promise<ISessionIdentityRegisterView> {
    const { email, password } = command;

    try {
      return await this.identity.register({ email, password });
    } catch (error) {
      throw SessionCustomerIdentityCoreAdapter.translate(error);
    }
  }

  public async login(
    command: ISessionIdentityLoginCommand,
  ): Promise<ISessionIdentityAccessTokenView> {
    const { email, password } = command;

    try {
      return await this.identity.login({ email, password });
    } catch (error) {
      throw SessionCustomerIdentityCoreAdapter.translate(error);
    }
  }

  private static translate(error: unknown): unknown {
    if (
      error instanceof DomainException &&
      SessionCustomerIdentityCoreAdapter.isIdentityCode(error.code)
    ) {
      return new SessionDomainException(error.code, error.message);
    }

    return error;
  }

  private static isIdentityCode(code: string): code is IdentityErrorCodeEnum {
    return Object.values<string>(IdentityErrorCodeEnum).includes(code);
  }
}
