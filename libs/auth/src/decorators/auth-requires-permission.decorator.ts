import { CustomDecorator, SetMetadata } from '@nestjs/common';

import { PermissionCodeEnum } from '@acme-libs/kernel';

import { AuthMetadataKeyEnum } from '../enums/auth-metadata-key.enum';

export const RequiresPermission = (permission: PermissionCodeEnum): CustomDecorator =>
  SetMetadata(AuthMetadataKeyEnum.PERMISSION, permission);
