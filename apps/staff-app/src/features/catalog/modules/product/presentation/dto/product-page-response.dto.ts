import { ApiResponseProperty } from '@nestjs/swagger';

import { ProductResponseDto } from './product-response.dto';

export class ProductPageResponseDto {
  @ApiResponseProperty({ example: 1 })
  public page: number;

  @ApiResponseProperty({ example: 20 })
  public count: number;

  @ApiResponseProperty({ example: 3 })
  public pageCount: number;

  @ApiResponseProperty({ example: 42 })
  public total: number;

  @ApiResponseProperty({ type: [ProductResponseDto] })
  public data: ProductResponseDto[];
}
