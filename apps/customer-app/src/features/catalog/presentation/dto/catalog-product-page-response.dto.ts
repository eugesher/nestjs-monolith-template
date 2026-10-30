import { ApiResponseProperty } from '@nestjs/swagger';

import { CatalogProductResponseDto } from './catalog-product-response.dto';

export class CatalogProductPageResponseDto {
  @ApiResponseProperty({ type: [CatalogProductResponseDto] })
  public items: CatalogProductResponseDto[];

  @ApiResponseProperty({ example: 42 })
  public total: number;

  @ApiResponseProperty({ example: 1 })
  public page: number;

  @ApiResponseProperty({ example: 20 })
  public size: number;
}
