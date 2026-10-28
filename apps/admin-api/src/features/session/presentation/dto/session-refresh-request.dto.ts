import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SessionRefreshRequestDto {
  @ApiProperty()
  @IsString()
  public refreshToken: string;
}
