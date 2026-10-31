import { ApiResponseProperty } from '@nestjs/swagger';

export class OrderProductResponseDto {
  @ApiResponseProperty({ example: '900' })
  public id: string;

  @ApiResponseProperty({ example: '100' })
  public productId: string;

  @ApiResponseProperty({ example: 'SKU-0001' })
  public sku: string;

  @ApiResponseProperty({ example: 'Reference product' })
  public name: string;
}
