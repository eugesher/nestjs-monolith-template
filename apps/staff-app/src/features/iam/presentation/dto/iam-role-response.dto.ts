import { ApiResponseProperty } from '@nestjs/swagger';

import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';

export class IamRoleResponseDto {
  @ApiResponseProperty({ example: RoleEnum.EDITOR })
  public name: RoleEnum;

  @ApiResponseProperty({ example: [PermissionCodeEnum.ITEM_READ, PermissionCodeEnum.ITEM_WRITE] })
  public permissionCodes: PermissionCodeEnum[];
}
