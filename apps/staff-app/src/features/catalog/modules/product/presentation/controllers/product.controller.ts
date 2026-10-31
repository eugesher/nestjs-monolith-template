import { Body, Controller, Get, Param, Patch, Post, Put, Query, UseFilters } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { IfMatch } from '@acme-staff-common/shared/concurrency';
import { RequiresPermission } from '@acme-libs/auth';
import { IdempotencyKey } from '@acme-libs/http';
import { PermissionCodeEnum } from '@acme-libs/kernel';
import type { Maybe } from '@acme-libs/toolkit';
import {
  ProductArchiveUseCase,
  ProductCreateUseCase,
  ProductGetManyUseCase,
  ProductGetOneUseCase,
  ProductPublishUseCase,
  ProductRestockUseCase,
  ProductUpdateUseCase,
} from '../../application';
import { ProductCreateRequestDto } from '../dto/product-create-request.dto';
import { ProductGetManyRequestDto } from '../dto/product-get-many-request.dto';
import { ProductIdRequestDto } from '../dto/product-id-request.dto';
import { ProductPageResponseDto } from '../dto/product-page-response.dto';
import { ProductResponseDto } from '../dto/product-response.dto';
import { ProductRestockRequestDto } from '../dto/product-restock-request.dto';
import { ProductStockResponseDto } from '../dto/product-stock-response.dto';
import { ProductUpdateRequestDto } from '../dto/product-update-request.dto';
import { ProductHttpExceptionFilter } from '../filters/product-http-exception.filter';

@ApiTags('Catalog/Product')
@UseFilters(ProductHttpExceptionFilter)
@Controller('catalog/products')
export class ProductController {
  constructor(
    private readonly create: ProductCreateUseCase,
    private readonly getMany: ProductGetManyUseCase,
    private readonly getOne: ProductGetOneUseCase,
    private readonly update: ProductUpdateUseCase,
    private readonly publish: ProductPublishUseCase,
    private readonly archive: ProductArchiveUseCase,
    private readonly restock: ProductRestockUseCase,
  ) {}

  @Post()
  @RequiresPermission(PermissionCodeEnum.PRODUCT_WRITE)
  @ApiHeader({ name: 'Idempotency-Key', required: true, description: 'At most 128 characters' })
  @ApiOperation({ summary: 'Create a product (idempotent)' })
  @ApiCreatedResponse({ type: ProductResponseDto })
  public handleCreate(
    @Body() body: ProductCreateRequestDto,
    @IdempotencyKey() idempotencyKey: string,
  ): Promise<ProductResponseDto> {
    const { sku, name } = body;

    return this.create.execute({ sku, name, idempotencyKey });
  }

  @Get()
  @RequiresPermission(PermissionCodeEnum.PRODUCT_READ)
  @ApiOperation({ summary: 'List the catalog products, newest first' })
  @ApiOkResponse({ type: ProductPageResponseDto })
  public handleGetMany(@Query() query: ProductGetManyRequestDto): Promise<ProductPageResponseDto> {
    const { page, size } = query;

    return this.getMany.execute({ page, size });
  }

  @Get(':productId')
  @RequiresPermission(PermissionCodeEnum.PRODUCT_READ)
  @ApiOperation({ summary: 'Read one catalog product' })
  @ApiOkResponse({ type: ProductResponseDto })
  public handleGetOne(@Param() params: ProductIdRequestDto): Promise<ProductResponseDto> {
    const { productId } = params;

    return this.getOne.execute({ productId });
  }

  @Patch(':productId')
  @RequiresPermission(PermissionCodeEnum.PRODUCT_WRITE)
  @ApiHeader({ name: 'If-Match', required: false, description: 'The product version, for OCC' })
  @ApiOperation({ summary: 'Update the fields of a product (optimistic concurrency)' })
  @ApiOkResponse({ type: ProductResponseDto })
  public handleUpdate(
    @Param() params: ProductIdRequestDto,
    @Body() body: ProductUpdateRequestDto,
    @IfMatch() expectedVersion: Maybe<number>,
  ): Promise<ProductResponseDto> {
    const { productId } = params;
    const { name } = body;

    return this.update.execute({ productId, name, expectedVersion });
  }

  @Put(':productId/publish')
  @RequiresPermission(PermissionCodeEnum.PRODUCT_WRITE)
  @ApiHeader({ name: 'If-Match', required: false, description: 'The product version, for OCC' })
  @ApiOperation({
    summary: 'Publish a draft product to the customer catalog (optimistic concurrency)',
  })
  @ApiOkResponse({ type: ProductResponseDto })
  public handlePublish(
    @Param() params: ProductIdRequestDto,
    @IfMatch() expectedVersion: Maybe<number>,
  ): Promise<ProductResponseDto> {
    const { productId } = params;

    return this.publish.execute({ productId, expectedVersion });
  }

  @Put(':productId/archive')
  @RequiresPermission(PermissionCodeEnum.PRODUCT_ARCHIVE)
  @ApiHeader({ name: 'If-Match', required: false, description: 'The product version, for OCC' })
  @ApiOperation({ summary: 'Archive a product (optimistic concurrency)' })
  @ApiOkResponse({ type: ProductResponseDto })
  public handleArchive(
    @Param() params: ProductIdRequestDto,
    @IfMatch() expectedVersion: Maybe<number>,
  ): Promise<ProductResponseDto> {
    const { productId } = params;

    return this.archive.execute({ productId, expectedVersion });
  }

  @Post(':productId/stock')
  @RequiresPermission(PermissionCodeEnum.PRODUCT_RESTOCK)
  @ApiHeader({ name: 'Idempotency-Key', required: true, description: 'At most 128 characters' })
  @ApiOperation({
    summary: 'Add units to the stock of a product that is not archived (idempotent)',
  })
  @ApiCreatedResponse({ type: ProductStockResponseDto })
  public handleRestock(
    @Param() params: ProductIdRequestDto,
    @Body() body: ProductRestockRequestDto,
    @IdempotencyKey() idempotencyKey: string,
  ): Promise<ProductStockResponseDto> {
    const { productId } = params;
    const { quantity } = body;

    return this.restock.execute({ productId, quantity, idempotencyKey });
  }
}
