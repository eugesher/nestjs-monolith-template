import { ApiResponseProperty } from '@nestjs/swagger';

export class ProductStockResponseDto {
  @ApiResponseProperty({ example: '12' })
  public productId: string;

  @ApiResponseProperty({ example: 25 })
  public quantity: number;
}
