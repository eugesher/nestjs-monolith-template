import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CatalogProductListUseCase } from '../../application';
import { CatalogProductListQueryDto, CatalogProductPageResponseDto } from '../dto';

@ApiTags('Catalog')
@Controller('products')
export class CatalogController {
  constructor(private readonly productList: CatalogProductListUseCase) {}

  @Get()
  @ApiOperation({ summary: 'List the active products, by id' })
  @ApiOkResponse({ type: CatalogProductPageResponseDto })
  public async handleProductList(
    @Query() query: CatalogProductListQueryDto,
  ): Promise<CatalogProductPageResponseDto> {
    const { page, limit } = query;

    return await this.productList.execute({ page, limit });
  }
}
