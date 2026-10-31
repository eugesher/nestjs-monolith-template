import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsEnum, IsString, MinLength } from 'class-validator';

import { RoleEnum } from '@acme-libs/kernel';

export class UserRegisterRequestDto {
  @ApiProperty({ example: 'editor@example.com' })
  @IsEmail()
  public email: string;

  @ApiProperty({ example: 'change-me-please-32' })
  @IsString()
  @MinLength(12)
  public password: string;

  @ApiProperty({ enum: RoleEnum, isArray: true, example: [RoleEnum.EDITOR] })
  @IsArray()
  @IsEnum(RoleEnum, { each: true })
  public roles: RoleEnum[];
}
