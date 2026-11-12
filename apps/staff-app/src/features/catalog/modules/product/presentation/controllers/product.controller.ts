import { Body, Controller, Get, Param, Patch, Post, Put, Query, UseFilters } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser, RequiresPermission } from '@acme-libs/auth';
import { IdempotencyKey } from '@acme-libs/http';
import { PermissionCodeEnum } from '@acme-libs/kernel';
import { IfMatch } from '@acme-staff/common/shared';
import type { Maybe } from '@acme-libs/toolkit';
import type { IAuthCurrentUserView } from '@acme-libs/contracts/auth';

import {
  ProductArchiveUseCase,
  ProductCreateUseCase,
  ProductGetManyUseCase,
  ProductGetOneUseCase,
  ProductGetTagsUseCase,
  ProductPublishUseCase,
  ProductReplaceTagsUseCase,
  ProductUpdateUseCase,
} from '../../application';
import {
  ProductCreateRequestDto,
  ProductGetManyQueryDto,
  ProductIdParamDto,
  ProductPageResponseDto,
  ProductResponseDto,
  ProductTagsReplaceRequestDto,
  ProductTagsResponseDto,
  ProductUpdateRequestDto,
} from '../dto';
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
    private readonly getTags: ProductGetTagsUseCase,
    private readonly replaceTags: ProductReplaceTagsUseCase,
  ) {}

  @Post()
  @RequiresPermission(PermissionCodeEnum.PRODUCT_WRITE)
  @ApiHeader({ name: 'Idempotency-Key', required: true, description: 'At most 128 characters' })
  @ApiOperation({ summary: 'Create a product (idempotent)' })
  @ApiCreatedResponse({ type: ProductResponseDto })
  public async handleCreate(
    @CurrentUser() user: IAuthCurrentUserView,
    @Body() body: ProductCreateRequestDto,
    @IdempotencyKey() idempotencyKey: string,
  ): Promise<ProductResponseDto> {
    const { id: staffUserId } = user;
    const { sku, name } = body;

    return await this.create.execute({ sku, name, staffUserId, idempotencyKey });
  }

  @Get()
  @RequiresPermission(PermissionCodeEnum.PRODUCT_READ)
  @ApiOperation({ summary: 'List the catalog products, newest first, optionally by tag' })
  @ApiOkResponse({ type: ProductPageResponseDto })
  public async handleGetMany(
    @Query() query: ProductGetManyQueryDto,
  ): Promise<ProductPageResponseDto> {
    const { page, limit, tagId } = query;

    return await this.getMany.execute({ page, limit, tagId });
  }

  @Get(':productId')
  @RequiresPermission(PermissionCodeEnum.PRODUCT_READ)
  @ApiOperation({ summary: 'Read one catalog product' })
  @ApiOkResponse({ type: ProductResponseDto })
  public async handleGetOne(@Param() params: ProductIdParamDto): Promise<ProductResponseDto> {
    const { productId } = params;

    return await this.getOne.execute({ productId });
  }

  @Patch(':productId')
  @RequiresPermission(PermissionCodeEnum.PRODUCT_WRITE)
  @ApiHeader({ name: 'If-Match', required: false, description: 'The product version, for OCC' })
  @ApiOperation({ summary: 'Update the fields of a product (optimistic concurrency)' })
  @ApiOkResponse({ type: ProductResponseDto })
  public async handleUpdate(
    @Param() params: ProductIdParamDto,
    @Body() body: ProductUpdateRequestDto,
    @IfMatch() expectedVersion: Maybe<number>,
  ): Promise<ProductResponseDto> {
    const { productId } = params;
    const { name } = body;

    return await this.update.execute({ productId, name, expectedVersion });
  }

  @Put(':productId/publish')
  @RequiresPermission(PermissionCodeEnum.PRODUCT_WRITE)
  @ApiHeader({ name: 'If-Match', required: false, description: 'The product version, for OCC' })
  @ApiOperation({
    summary: 'Publish a draft product to the customer catalog (optimistic concurrency)',
  })
  @ApiOkResponse({ type: ProductResponseDto })
  public async handlePublish(
    @Param() params: ProductIdParamDto,
    @IfMatch() expectedVersion: Maybe<number>,
  ): Promise<ProductResponseDto> {
    const { productId } = params;

    return await this.publish.execute({ productId, expectedVersion });
  }

  @Put(':productId/archive')
  @RequiresPermission(PermissionCodeEnum.PRODUCT_ARCHIVE)
  @ApiHeader({ name: 'If-Match', required: false, description: 'The product version, for OCC' })
  @ApiOperation({ summary: 'Archive a product (optimistic concurrency)' })
  @ApiOkResponse({ type: ProductResponseDto })
  public async handleArchive(
    @Param() params: ProductIdParamDto,
    @IfMatch() expectedVersion: Maybe<number>,
  ): Promise<ProductResponseDto> {
    const { productId } = params;

    return await this.archive.execute({ productId, expectedVersion });
  }

  @Get(':productId/tags')
  @RequiresPermission(PermissionCodeEnum.PRODUCT_READ)
  @ApiOperation({ summary: 'Read the tags of a product, by name' })
  @ApiOkResponse({ type: ProductTagsResponseDto })
  public async handleGetTags(@Param() params: ProductIdParamDto): Promise<ProductTagsResponseDto> {
    const { productId } = params;

    return await this.getTags.execute({ productId });
  }

  @Put(':productId/tags')
  @RequiresPermission(PermissionCodeEnum.PRODUCT_WRITE)
  @ApiOperation({ summary: 'Replace the tags of a product' })
  @ApiOkResponse({ type: ProductTagsResponseDto })
  public async handleReplaceTags(
    @Param() params: ProductIdParamDto,
    @Body() body: ProductTagsReplaceRequestDto,
  ): Promise<ProductTagsResponseDto> {
    const { productId } = params;
    const { tagIds } = body;

    return await this.replaceTags.execute({ productId, tagIds });
  }
}
