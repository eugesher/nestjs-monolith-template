import { ApiProperty } from '@nestjs/swagger';
import { IsArray, Matches } from 'class-validator';

export class UserRolesReassignRequestDto {
  @ApiProperty({ isArray: true, example: ['2', '3'] })
  @IsArray()
  @Matches(/^[1-9]\d{0,19}$/, { each: true, message: 'roleIds must be positive integers' })
  public roleIds: string[];
}
