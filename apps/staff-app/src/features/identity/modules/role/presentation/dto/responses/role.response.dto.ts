import { ApiResponseProperty } from '@nestjs/swagger';

import { PermissionCodeEnum } from '@acme-libs/kernel';

export class RoleResponseDto {
  @ApiResponseProperty({ example: '2' })
  public id: string;

  @ApiResponseProperty({ example: 'editor' })
  public name: string;

  @ApiResponseProperty({
    example: [
      PermissionCodeEnum.IDENTITY_ROLE_ASSIGN,
      PermissionCodeEnum.IDENTITY_PERMISSION_ASSIGN,
    ],
  })
  public permissionCodes: PermissionCodeEnum[];
}
