import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class ReminderRescheduleRequestDto {
  @ApiProperty({ example: '2026-07-01', description: 'A calendar date, never an instant' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dueOn must be a calendar date formatted YYYY-MM-DD' })
  public dueOn: string;
}
