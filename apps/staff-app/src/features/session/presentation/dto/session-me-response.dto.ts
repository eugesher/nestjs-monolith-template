import { ApiResponseProperty } from '@nestjs/swagger';

import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';

export class SessionMeResponseDto {
  @ApiResponseProperty()
  public id: string;

  @ApiResponseProperty({ example: 'admin@example.com' })
  public email: string;

  @ApiResponseProperty({ example: [RoleEnum.ADMIN] })
  public roles: RoleEnum[];

  @ApiResponseProperty({ example: [PermissionCodeEnum.ITEM_READ, PermissionCodeEnum.ITEM_WRITE] })
  public permissions: PermissionCodeEnum[];
}
