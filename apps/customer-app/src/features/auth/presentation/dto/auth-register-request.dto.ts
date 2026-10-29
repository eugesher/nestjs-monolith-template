import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class AuthRegisterRequestDto {
  @ApiProperty({ example: 'eve@example.com' })
  @IsEmail()
  @MaxLength(255)
  public email: string;

  @ApiProperty({ example: 'eve-password-please-change' })
  @IsString()
  @MinLength(12)
  @MaxLength(256)
  public password: string;
}
