import {
  ForbiddenException,
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import type { PermissionCodeEnum } from '@acme-libs/kernel';
import type { Maybe } from '@acme-libs/toolkit';

import { AuthMetadataKeyEnum } from '../enums/auth-metadata-key.enum';
import type { IAuthRequest } from '../interfaces/auth-request.interface';

@Injectable()
export class AuthPermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  public canActivate(context: ExecutionContext): boolean {
    const metadataTargets = [context.getHandler(), context.getClass()];
    const required = this.reflector.getAllAndOverride<Maybe<PermissionCodeEnum>>(
      AuthMetadataKeyEnum.PERMISSION,
      metadataTargets,
    );

    if (!required) {
      return true;
    }

    const request = context.switchToHttp().getRequest<IAuthRequest>();
    const held = request.user?.permissionCodes;

    if (AuthPermissionGuard.isForbidden(required, held)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }

  private static isForbidden(
    required: PermissionCodeEnum,
    held: Maybe<readonly PermissionCodeEnum[]>,
  ): boolean {
    if (!held) {
      return true;
    }

    return !held.includes(required);
  }
}
