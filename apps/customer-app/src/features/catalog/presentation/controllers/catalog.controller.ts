import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CatalogGetManyUseCase } from '../../application';
import { CatalogGetManyRequestDto } from '../dto/catalog-get-many-request.dto';
import { CatalogProductPageResponseDto } from '../dto/catalog-product-page-response.dto';

@ApiTags('Catalog')
@Controller('products')
export class CatalogController {
  constructor(private readonly getMany: CatalogGetManyUseCase) {}

  @Get()
  @ApiOperation({ summary: 'List the active products, by id' })
  @ApiOkResponse({ type: CatalogProductPageResponseDto })
  public handleGetMany(
    @Query() query: CatalogGetManyRequestDto,
  ): Promise<CatalogProductPageResponseDto> {
    const { page, size } = query;

    return this.getMany.execute({ page, size });
  }
}
