import { ApiResponseProperty } from '@nestjs/swagger';

export class ReminderSummaryResponseDto {
  @ApiResponseProperty({ example: 3 })
  public pending: number;

  @ApiResponseProperty({ example: '2026-06-01' })
  public nextDueOn: string | null;
}
