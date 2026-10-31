import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { RoleEnum } from '@acme-libs/kernel';

export class UserAssignRoleRequestDto {
  @ApiProperty({ enum: RoleEnum })
  @IsEnum(RoleEnum)
  public role: RoleEnum;
}
