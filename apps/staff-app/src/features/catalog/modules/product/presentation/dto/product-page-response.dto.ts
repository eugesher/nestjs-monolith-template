import { ApiResponseProperty } from '@nestjs/swagger';

import { ProductResponseDto } from './product-response.dto';

export class ProductPageResponseDto {
  @ApiResponseProperty({ type: [ProductResponseDto] })
  public items: ProductResponseDto[];

  @ApiResponseProperty({ example: 42 })
  public total: number;

  @ApiResponseProperty({ example: 1 })
  public page: number;

  @ApiResponseProperty({ example: 20 })
  public size: number;
}
