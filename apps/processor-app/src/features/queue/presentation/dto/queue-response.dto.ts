import { ApiResponseProperty } from '@nestjs/swagger';

import { QueueJobCountsResponseDto } from './queue-job-counts-response.dto';

export class QueueResponseDto {
  @ApiResponseProperty({ example: 'ledger-record' })
  public name: string;

  @ApiResponseProperty({ type: QueueJobCountsResponseDto })
  public jobCounts: QueueJobCountsResponseDto;
}
