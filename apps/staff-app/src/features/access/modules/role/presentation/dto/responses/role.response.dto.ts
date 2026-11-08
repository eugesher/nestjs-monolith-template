import { ApiResponseProperty } from '@nestjs/swagger';

import { PermissionCodeEnum } from '@acme-libs/kernel';

export class RoleResponseDto {
  @ApiResponseProperty({ example: '2' })
  public id: string;

  @ApiResponseProperty({ example: 'editor' })
  public name: string;

  @ApiResponseProperty({
    example: [PermissionCodeEnum.ACCESS_MANAGEMENT, PermissionCodeEnum.ACCESS_MANAGEMENT],
  })
  public permissionCodes: PermissionCodeEnum[];
}
