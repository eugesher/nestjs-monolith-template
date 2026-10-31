import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export class ReminderIdRequestDto {
  @ApiProperty({ example: '31', description: 'A positive integer of up to 20 digits' })
  @Matches(/^[1-9]\d{0,19}$/, { message: 'reminderId must be a positive integer' })
  public reminderId: string;
}
