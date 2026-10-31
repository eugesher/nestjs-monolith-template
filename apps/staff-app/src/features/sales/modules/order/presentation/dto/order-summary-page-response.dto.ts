import { ApiResponseProperty } from '@nestjs/swagger';

import { OrderSummaryResponseDto } from './order-summary-response.dto';

export class OrderSummaryPageResponseDto {
  @ApiResponseProperty({ type: [OrderSummaryResponseDto] })
  public items: OrderSummaryResponseDto[];

  @ApiResponseProperty({ example: 42 })
  public total: number;

  @ApiResponseProperty({ example: 1 })
  public page: number;

  @ApiResponseProperty({ example: 20 })
  public size: number;
}
