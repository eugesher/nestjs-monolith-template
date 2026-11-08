import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UserAssignRoleRequestDto {
  @ApiProperty({ example: 'editor' })
  @IsString()
  public role: string;
}
