import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export class UserAssignRoleRequestDto {
  @ApiProperty({ example: '2', description: 'A positive integer of up to 20 digits' })
  @Matches(/^[1-9]\d{0,19}$/, { message: 'roleId must be a positive integer' })
  public roleId: string;
}
