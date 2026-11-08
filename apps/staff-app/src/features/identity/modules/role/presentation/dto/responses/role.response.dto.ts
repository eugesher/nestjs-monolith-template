import { ApiResponseProperty } from '@nestjs/swagger';

import { PermissionCodeEnum } from '@acme-libs/kernel';

export class RoleResponseDto {
  @ApiResponseProperty({ example: 'editor' })
  public name: string;

  @ApiResponseProperty({
    example: [PermissionCodeEnum.IAM_ASSIGN, PermissionCodeEnum.IAM_ROLE_EDIT],
  })
  public permissionCodes: PermissionCodeEnum[];
}
