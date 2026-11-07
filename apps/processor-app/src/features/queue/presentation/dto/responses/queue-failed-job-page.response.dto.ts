import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';

class QueueFailedJobPageResponseItemDto {
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

  @ApiProperty({ readOnly: true, nullable: true, example: ['Error: Data too long for column'] })
  public stacktrace: string[] | null;

  @ApiResponseProperty({ example: null })
  public returnvalue: unknown;

  @ApiProperty({ readOnly: true, nullable: true, example: null })
  public debounceId: string | null;

  @ApiProperty({ readOnly: true, nullable: true, example: 1767225601000 })
  public finishedOn: number | null;

  @ApiProperty({ readOnly: true, nullable: true, example: 1767225600500 })
  public processedOn: number | null;
}

export class QueueFailedJobPageResponseDto {
  @ApiResponseProperty({ example: 1 })
  public page: number;

  @ApiResponseProperty({ example: 20 })
  public count: number;

  @ApiResponseProperty({ example: 3 })
  public pageCount: number;

  @ApiResponseProperty({ example: 42 })
  public total: number;

  @ApiResponseProperty({ type: [QueueFailedJobPageResponseItemDto] })
  public data: QueueFailedJobPageResponseItemDto[];
}
