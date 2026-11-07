import { ApiResponseProperty } from '@nestjs/swagger';

export class QueueFailedJobResponseDto {
  @ApiResponseProperty({ example: '42' })
  public id: string | number;

  @ApiResponseProperty({ example: '__default__' })
  public name: string;

  @ApiResponseProperty({ example: { operationKey: 'product-created:12' } })
  public data: unknown;

  @ApiResponseProperty({ example: { attempts: 3, backoff: { type: 'exponential', delay: 1000 } } })
  public opts: unknown;

  @ApiResponseProperty({ example: 0 })
  public progress: number;

  @ApiResponseProperty({ example: 0 })
  public delay: number;

  @ApiResponseProperty({ example: 1767225600000 })
  public timestamp: number;

  @ApiResponseProperty({ example: 3 })
  public attemptsMade: number;

  @ApiResponseProperty({ example: 'Data too long for column' })
  public failedReason: unknown;

  @ApiResponseProperty({ example: ['Error: Data too long for column'] })
  public stacktrace: string[] | null;

  @ApiResponseProperty({ example: null })
  public returnvalue: unknown;

  @ApiResponseProperty({ example: null })
  public debounceId: string | null;

  @ApiResponseProperty({ example: 1767225601000 })
  public finishedOn: number | null;

  @ApiResponseProperty({ example: 1767225600500 })
  public processedOn: number | null;
}
