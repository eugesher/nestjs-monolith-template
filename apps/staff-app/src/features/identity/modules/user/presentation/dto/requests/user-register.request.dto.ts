import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class UserRegisterRequestDto {
  @ApiProperty({ example: 'editor@example.com' })
  @IsEmail()
  public email: string;

  @ApiProperty({ example: 'change-me-please-32' })
  @IsString()
  @MinLength(12)
  public password: string;

  @ApiProperty({ isArray: true, example: ['2'] })
  @IsArray()
  @Matches(/^[1-9]\d{0,19}$/, { each: true, message: 'roleIds must be positive integers' })
  public roleIds: string[];
}
