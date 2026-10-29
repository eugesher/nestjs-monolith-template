import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class SessionLoginRequestDto {
  @ApiProperty({ example: 'admin@example.com' })
  @IsEmail()
  @MaxLength(255)
  public email: string;

  @ApiProperty({ example: 'change-me-please-32' })
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  public password: string;
}
