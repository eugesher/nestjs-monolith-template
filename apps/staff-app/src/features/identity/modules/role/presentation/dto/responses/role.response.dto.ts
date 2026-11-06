import { ApiResponseProperty } from '@nestjs/swagger';

import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';

export class RoleResponseDto {
  @ApiResponseProperty({ example: RoleEnum.EDITOR })
  public name: RoleEnum;

  @ApiResponseProperty({
    example: [PermissionCodeEnum.IAM_ASSIGN, PermissionCodeEnum.IAM_ROLE_EDIT],
  })
  public permissionCodes: PermissionCodeEnum[];
}
