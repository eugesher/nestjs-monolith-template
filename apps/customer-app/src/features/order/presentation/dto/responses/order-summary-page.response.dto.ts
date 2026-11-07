import { ApiResponseProperty } from '@nestjs/swagger';

class OrderSummaryPageResponseItemDto {
  @ApiResponseProperty({ example: '600' })
  public id: string;

  @ApiResponseProperty({ example: '2026-01-01T00:00:00.000Z' })
  public createdAt: string;
}

export class OrderSummaryPageResponseDto {
  @ApiResponseProperty({ example: 1 })
  public page: number;

  @ApiResponseProperty({ example: 20 })
  public count: number;

  @ApiResponseProperty({ example: 3 })
  public pageCount: number;

  @ApiResponseProperty({ example: 42 })
  public total: number;

  @ApiResponseProperty({ type: [OrderSummaryPageResponseItemDto] })
  public data: OrderSummaryPageResponseItemDto[];
}
