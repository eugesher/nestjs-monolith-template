import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsString, MinLength } from 'class-validator';

export class UserRegisterRequestDto {
  @ApiProperty({ example: 'editor@example.com' })
  @IsEmail()
  public email: string;

  @ApiProperty({ example: 'change-me-please-32' })
  @IsString()
  @MinLength(12)
  public password: string;

  @ApiProperty({ isArray: true, example: ['editor'] })
  @IsArray()
  @IsString({ each: true })
  public roles: string[];
}
