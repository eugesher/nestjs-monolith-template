import { ApiResponseProperty } from '@nestjs/swagger';

class CatalogProductPageResponseItemDto {
  @ApiResponseProperty({ example: '12' })
  public id: string;

  @ApiResponseProperty({ example: 'SKU-0001' })
  public sku: string;

  @ApiResponseProperty({ example: 'Reference product' })
  public name: string;
}

export class CatalogProductPageResponseDto {
  @ApiResponseProperty({ example: 1 })
  public page: number;

  @ApiResponseProperty({ example: 20 })
  public count: number;

  @ApiResponseProperty({ example: 3 })
  public pageCount: number;

  @ApiResponseProperty({ example: 42 })
  public total: number;

  @ApiResponseProperty({ type: [CatalogProductPageResponseItemDto] })
  public data: CatalogProductPageResponseItemDto[];
}
