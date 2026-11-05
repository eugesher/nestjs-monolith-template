import { ApiResponseProperty } from '@nestjs/swagger';

import { QueueFailedJobResponseDto } from './queue-failed-job.response.dto';

export class QueueFailedJobPageResponseDto {
  @ApiResponseProperty({ example: 1 })
  public page: number;

  @ApiResponseProperty({ example: 20 })
  public count: number;

  @ApiResponseProperty({ example: 3 })
  public pageCount: number;

  @ApiResponseProperty({ example: 42 })
  public total: number;

  @ApiResponseProperty({ type: [QueueFailedJobResponseDto] })
  public data: QueueFailedJobResponseDto[];
}
