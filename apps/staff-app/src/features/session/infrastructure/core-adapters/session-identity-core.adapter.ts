import { Inject, Injectable } from '@nestjs/common';

import {
  IDENTITY_CORE_SESSION_PORT,
  type IIdentityCoreSessionPort,
} from '@acme-core/contracts/identity';
import { IdentityErrorCodeEnum } from '@acme-libs/kernel';
import { DomainException } from '@acme-libs/toolkit';
import { SessionDomainException } from '../../domain';
import {
  ISessionIdentityAccessTokenView,
  ISessionIdentityLoginCommand,
  ISessionIdentityPort,
} from '../../outbound';

@Injectable()
export class SessionIdentityCoreAdapter implements ISessionIdentityPort {
  constructor(
    @Inject(IDENTITY_CORE_SESSION_PORT)
    private readonly identity: IIdentityCoreSessionPort,
  ) {}

  public async login(
    command: ISessionIdentityLoginCommand,
  ): Promise<ISessionIdentityAccessTokenView> {
    const { email, password } = command;

    try {
      return await this.identity.login({ email, password });
    } catch (error) {
      throw SessionIdentityCoreAdapter.translate(error);
    }
  }

  private static translate(error: unknown): unknown {
    if (error instanceof DomainException && SessionIdentityCoreAdapter.isIdentityCode(error.code)) {
      return new SessionDomainException(error.code, error.message);
    }

    return error;
  }

  private static isIdentityCode(code: string): code is IdentityErrorCodeEnum {
    return Object.values<string>(IdentityErrorCodeEnum).includes(code);
  }
}
