import { Inject, Injectable } from '@nestjs/common';

import {
  STAFF_IDENTITY_CORE_SESSION_PORT,
  type IStaffIdentityCoreSessionPort,
} from '@acme-core/contracts/staff-identity';
import { IdentityErrorCodeEnum } from '@acme-libs/kernel';
import { DomainException, Maybe } from '@acme-libs/toolkit';
import { SessionDomainException } from '../../domain';
import {
  ISessionIdentityAccessTokenView,
  ISessionIdentityFindSubjectQuery,
  ISessionIdentityLoginCommand,
  ISessionIdentityPort,
  ISessionIdentitySubjectView,
} from '../../outbound';

@Injectable()
export class SessionStaffIdentityCoreAdapter implements ISessionIdentityPort {
  constructor(
    @Inject(STAFF_IDENTITY_CORE_SESSION_PORT)
    private readonly identity: IStaffIdentityCoreSessionPort,
  ) {}

  public async login(
    command: ISessionIdentityLoginCommand,
  ): Promise<ISessionIdentityAccessTokenView> {
    const { email, password } = command;

    try {
      return await this.identity.login({ email, password });
    } catch (error) {
      throw SessionStaffIdentityCoreAdapter.translate(error);
    }
  }

  public findSubject(
    query: ISessionIdentityFindSubjectQuery,
  ): Promise<Maybe<ISessionIdentitySubjectView>> {
    const { userId } = query;

    return this.identity.validateSubject({ userId });
  }

  private static translate(error: unknown): unknown {
    if (
      error instanceof DomainException &&
      SessionStaffIdentityCoreAdapter.isIdentityCode(error.code)
    ) {
      return new SessionDomainException(error.code, error.message);
    }

    return error;
  }

  private static isIdentityCode(code: string): code is IdentityErrorCodeEnum {
    return Object.values<string>(IdentityErrorCodeEnum).includes(code);
  }
}
