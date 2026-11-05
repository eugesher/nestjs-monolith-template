import { ApiResponseProperty } from '@nestjs/swagger';

export class CatalogProductResponseDto {
  @ApiResponseProperty({ example: '12' })
  public id: string;

  @ApiResponseProperty({ example: 'SKU-0001' })
  public sku: string;

  @ApiResponseProperty({ example: 'Reference product' })
  public name: string;
}
