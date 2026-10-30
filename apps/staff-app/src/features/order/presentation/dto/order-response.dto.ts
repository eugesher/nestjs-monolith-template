import { ApiResponseProperty } from '@nestjs/swagger';

import { OrderProductResponseDto } from './order-product-response.dto';

export class OrderResponseDto {
  @ApiResponseProperty({ example: '600' })
  public id: string;

  @ApiResponseProperty({ example: '00000000-0000-4000-8000-000000000101' })
  public customerId: string;

  @ApiResponseProperty({ example: '2026-01-01T00:00:00.000Z' })
  public createdAt: string;

  @ApiResponseProperty({ type: [OrderProductResponseDto] })
  public products: OrderProductResponseDto[];
}
