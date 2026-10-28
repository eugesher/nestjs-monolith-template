import { CustomDecorator, SetMetadata } from '@nestjs/common';

import { RoleEnum } from '@acme-libs/kernel';
import { AuthMetadataKeyEnum } from '../enums/auth-metadata-key.enum';

export const Roles = (...roles: RoleEnum[]): CustomDecorator =>
  SetMetadata(AuthMetadataKeyEnum.ROLES, roles);
