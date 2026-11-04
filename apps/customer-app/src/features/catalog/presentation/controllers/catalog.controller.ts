import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CatalogProductListUseCase } from '../../application';
import { CatalogProductListRequestDto } from '../dto/catalog-product-list-request.dto';
import { CatalogProductPageResponseDto } from '../dto/catalog-product-page-response.dto';

@ApiTags('Catalog')
@Controller('products')
export class CatalogController {
  constructor(private readonly productList: CatalogProductListUseCase) {}

  @Get()
  @ApiOperation({ summary: 'List the active products, by id' })
  @ApiOkResponse({ type: CatalogProductPageResponseDto })
  public async handleProductList(
    @Query() query: CatalogProductListRequestDto,
  ): Promise<CatalogProductPageResponseDto> {
    const { page, limit } = query;

    return await this.productList.execute({ page, limit });
  }
}
