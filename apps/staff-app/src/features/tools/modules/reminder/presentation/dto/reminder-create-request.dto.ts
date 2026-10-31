import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class ReminderCreateRequestDto {
  @ApiProperty({ example: 'Renew the subscription' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  public title: string;

  @ApiPropertyOptional({ example: 'The annual one, not the monthly add-on.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  public body?: string;

  @ApiProperty({ example: '2026-06-01', description: 'A calendar date, never an instant' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dueOn must be a calendar date formatted YYYY-MM-DD' })
  public dueOn: string;
}
