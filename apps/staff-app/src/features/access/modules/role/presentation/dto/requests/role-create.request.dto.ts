import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsString, MaxLength, MinLength } from 'class-validator';

import { PermissionCodeEnum } from '@acme-libs/kernel';

export class RoleCreateRequestDto {
  @ApiProperty({ example: 'auditor', minLength: 1, maxLength: 64 })
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  public name: string;

  @ApiProperty({
    enum: PermissionCodeEnum,
    isArray: true,
    example: [PermissionCodeEnum.LEDGER_READ],
  })
  @IsArray()
  @IsEnum(PermissionCodeEnum, { each: true })
  public permissionCodes: PermissionCodeEnum[];
}
