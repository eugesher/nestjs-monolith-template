import { Inject, Injectable } from '@nestjs/common';

import {
  STAFF_IDENTITY_CORE_AUTH_PORT,
  type IStaffIdentityCoreAuthPort,
} from '@acme-core/contracts/staff-identity';
import { IdentityErrorCodeEnum } from '@acme-libs/kernel';
import { DomainException, Maybe } from '@acme-libs/toolkit';
import { AuthDomainException } from '../../domain';
import {
  IAuthIdentityAccessTokenView,
  IAuthIdentityFindSubjectQuery,
  IAuthIdentityLoginCommand,
  IAuthIdentityPort,
  IAuthIdentitySubjectView,
} from '../../outbound';

@Injectable()
export class AuthStaffIdentityCoreAdapter implements IAuthIdentityPort {
  constructor(
    @Inject(STAFF_IDENTITY_CORE_AUTH_PORT)
    private readonly identity: IStaffIdentityCoreAuthPort,
  ) {}

  public async login(command: IAuthIdentityLoginCommand): Promise<IAuthIdentityAccessTokenView> {
    const { email, password } = command;

    try {
      return await this.identity.login({ email, password });
    } catch (error) {
      throw AuthStaffIdentityCoreAdapter.translate(error);
    }
  }

  public findSubject(
    query: IAuthIdentityFindSubjectQuery,
  ): Promise<Maybe<IAuthIdentitySubjectView>> {
    const { userId } = query;

    return this.identity.validateSubject({ userId });
  }

  private static translate(error: unknown): unknown {
    if (
      error instanceof DomainException &&
      AuthStaffIdentityCoreAdapter.isIdentityCode(error.code)
    ) {
      return new AuthDomainException(error.code, error.message);
    }

    return error;
  }

  private static isIdentityCode(code: string): code is IdentityErrorCodeEnum {
    return Object.values<string>(IdentityErrorCodeEnum).includes(code);
  }
}
