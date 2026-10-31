import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsEnum } from 'class-validator';

import { PermissionCodeEnum } from '@acme-libs/kernel';

export class RoleUpdatePermissionsRequestDto {
  @ApiProperty({ enum: PermissionCodeEnum, isArray: true })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(PermissionCodeEnum, { each: true })
  public permissionCodes: PermissionCodeEnum[];
}
