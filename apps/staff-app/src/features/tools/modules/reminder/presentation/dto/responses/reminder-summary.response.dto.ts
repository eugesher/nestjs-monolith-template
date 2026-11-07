import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';

export class ReminderSummaryResponseDto {
  @ApiResponseProperty({ example: 3 })
  public pending: number;

  @ApiProperty({ readOnly: true, nullable: true, example: '2026-06-01' })
  public nextDueOn: string | null;
}
