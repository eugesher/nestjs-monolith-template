import { ApiResponseProperty } from '@nestjs/swagger';

import { OrderSummaryResponseDto } from './order-summary.response.dto';

export class OrderSummaryPageResponseDto {
  @ApiResponseProperty({ example: 1 })
  public page: number;

  @ApiResponseProperty({ example: 20 })
  public count: number;

  @ApiResponseProperty({ example: 3 })
  public pageCount: number;

  @ApiResponseProperty({ example: 42 })
  public total: number;

  @ApiResponseProperty({ type: [OrderSummaryResponseDto] })
  public data: OrderSummaryResponseDto[];
}
