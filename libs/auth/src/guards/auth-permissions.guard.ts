import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PermissionCodeEnum } from '@acme-libs/kernel';
import { Maybe } from '@acme-libs/toolkit';
import { AuthMetadataKeyEnum } from '../enums/auth-metadata-key.enum';
import { AuthClaimHelper } from '../helpers/auth-claim.helper';
import { IAuthRequest } from '../interfaces/auth-request.interface';

@Injectable()
export class AuthPermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  public canActivate(context: ExecutionContext): boolean {
    const targets = [context.getHandler(), context.getClass()];
    const required = this.reflector.getAllAndOverride<Maybe<PermissionCodeEnum[]>>(
      AuthMetadataKeyEnum.PERMISSIONS,
      targets,
    );
    const request = context.switchToHttp().getRequest<IAuthRequest>();

    if (!AuthClaimHelper.holdsAny(required, request.user?.permissions)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
