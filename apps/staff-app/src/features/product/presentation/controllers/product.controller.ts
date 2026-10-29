import { Body, Controller, Get, Param, Patch, Post, Query, UseFilters } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { IfMatch } from '@acme-staff-common/shared/concurrency';
import { IdempotencyKey } from '@acme-staff-common/shared/idempotency';
import { RequiresPermission } from '@acme-libs/auth';
import { PermissionCodeEnum } from '@acme-libs/kernel';
import type { Maybe } from '@acme-libs/toolkit';
import {
  ProductArchiveUseCase,
  ProductCreateUseCase,
  ProductGetManyUseCase,
  ProductGetOneUseCase,
  ProductRenameUseCase,
} from '../../application';
import { ProductCreateRequestDto } from '../dto/product-create-request.dto';
import { ProductGetManyRequestDto } from '../dto/product-get-many-request.dto';
import { ProductIdRequestDto } from '../dto/product-id-request.dto';
import { ProductPageResponseDto } from '../dto/product-page-response.dto';
import { ProductRenameRequestDto } from '../dto/product-rename-request.dto';
import { ProductResponseDto } from '../dto/product-response.dto';
import { ProductHttpExceptionFilter } from '../filters/product-http-exception.filter';

@ApiTags('Product')
@UseFilters(ProductHttpExceptionFilter)
@Controller('products')
export class ProductController {
  constructor(
    private readonly create: ProductCreateUseCase,
    private readonly getMany: ProductGetManyUseCase,
    private readonly getOne: ProductGetOneUseCase,
    private readonly rename: ProductRenameUseCase,
    private readonly archive: ProductArchiveUseCase,
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

  @Patch(':productId/name')
  @RequiresPermission(PermissionCodeEnum.PRODUCT_WRITE)
  @ApiHeader({ name: 'If-Match', required: false, description: 'The product version, for OCC' })
  @ApiOperation({ summary: 'Rename a product (optimistic concurrency)' })
  @ApiOkResponse({ type: ProductResponseDto })
  public handleRename(
    @Param() params: ProductIdRequestDto,
    @Body() body: ProductRenameRequestDto,
    @IfMatch() expectedVersion: Maybe<number>,
  ): Promise<ProductResponseDto> {
    const { productId } = params;
    const { name } = body;

    return this.rename.execute({ productId, name, expectedVersion });
  }

  @Patch(':productId/archive')
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
}
