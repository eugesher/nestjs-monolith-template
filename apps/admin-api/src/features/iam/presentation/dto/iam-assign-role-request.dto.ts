import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { RoleEnum } from '@acme-libs/kernel';

export class IamAssignRoleRequestDto {
  @ApiProperty({ enum: RoleEnum })
  @IsEnum(RoleEnum)
  public role: RoleEnum;
}
