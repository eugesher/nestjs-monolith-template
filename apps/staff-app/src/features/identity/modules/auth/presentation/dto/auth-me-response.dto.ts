import { ApiResponseProperty } from '@nestjs/swagger';

import { RoleEnum } from '@acme-libs/kernel';

export class AuthMeResponseDto {
  @ApiResponseProperty()
  public id: string;

  @ApiResponseProperty({ example: 'admin@example.com' })
  public email: string;

  @ApiResponseProperty({ example: [RoleEnum.ADMIN] })
  public roles: RoleEnum[];
}
