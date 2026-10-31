import { ApiResponseProperty } from '@nestjs/swagger';

import { RoleEnum } from '@acme-libs/kernel';

export class UserRolesResponseDto {
  @ApiResponseProperty()
  public id: string;

  @ApiResponseProperty({ example: [RoleEnum.EDITOR] })
  public roles: RoleEnum[];
}
