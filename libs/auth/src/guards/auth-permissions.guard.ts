import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AUTH_CLAIMS_PORT, type IAuthClaimsPort } from '@acme-libs/contracts/auth';
import { PermissionCodeEnum } from '@acme-libs/kernel';
import { Maybe } from '@acme-libs/toolkit';
import { AuthMetadataKeyEnum } from '../enums/auth-metadata-key.enum';
import { AuthClaimHelper } from '../helpers/auth-claim.helper';
import { IAuthRequest } from '../interfaces/auth-request.interface';

@Injectable()
export class AuthPermissionsGuard implements CanActivate {
  constructor(
    @Inject(AUTH_CLAIMS_PORT)
    private readonly claims: IAuthClaimsPort,
    private readonly reflector: Reflector,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];
    const required = this.reflector.getAllAndOverride<Maybe<PermissionCodeEnum[]>>(
      AuthMetadataKeyEnum.PERMISSIONS,
      targets,
    );

    if (!required || required.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<IAuthRequest>();

    if (!request.user) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const held = await this.claims.findPermissionCodes({ userId: request.user.id });

    if (!AuthClaimHelper.holdsAny(required, held)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
