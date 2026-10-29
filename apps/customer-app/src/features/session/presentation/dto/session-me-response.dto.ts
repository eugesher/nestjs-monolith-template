import { ApiResponseProperty } from '@nestjs/swagger';

import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';

export class SessionMeResponseDto {
  @ApiResponseProperty()
  public id: string;

  @ApiResponseProperty({ example: 'viewer@example.com' })
  public email: string;

  @ApiResponseProperty({ example: [RoleEnum.VIEWER] })
  public roles: RoleEnum[];

  @ApiResponseProperty({ example: [PermissionCodeEnum.ITEM_READ] })
  public permissions: PermissionCodeEnum[];
}
