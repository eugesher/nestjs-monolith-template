import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';

class QueueResponseJobCountsDto {
  @ApiResponseProperty({ example: 0 })
  public active: number;

  @ApiResponseProperty({ example: 0 })
  public completed: number;

  @ApiResponseProperty({ example: 2 })
  public failed: number;

  @ApiResponseProperty({ example: 0 })
  public delayed: number;

  @ApiResponseProperty({ example: 5 })
  public waiting: number;

  @ApiProperty({ readOnly: true, nullable: true, example: 0 })
  public paused: number | null;
}

export class QueueResponseDto {
  @ApiResponseProperty({ example: 'ledger-record' })
  public name: string;

  @ApiResponseProperty({ type: QueueResponseJobCountsDto })
  public jobCounts: QueueResponseJobCountsDto;
}
