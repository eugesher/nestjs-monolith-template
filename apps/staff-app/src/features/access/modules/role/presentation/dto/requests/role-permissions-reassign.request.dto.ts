import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum } from 'class-validator';

import { PermissionCodeEnum } from '@acme-libs/kernel';

export class RolePermissionsReassignRequestDto {
  @ApiProperty({ enum: PermissionCodeEnum, isArray: true })
  @IsArray()
  @IsEnum(PermissionCodeEnum, { each: true })
  public permissionCodes: PermissionCodeEnum[];
}
