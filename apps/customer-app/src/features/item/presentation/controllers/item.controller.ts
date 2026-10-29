import { Body, Controller, Get, Param, Patch, Post, Query, UseFilters } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { IfMatch } from '@acme-customer-common/shared/concurrency';
import { IdempotencyKey } from '@acme-customer-common/shared/idempotency';
import { CurrentUser, RequiresPermission } from '@acme-libs/auth';
import type { IAuthCurrentUserView } from '@acme-libs/contracts/auth';
import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import type { Maybe } from '@acme-libs/toolkit';
import {
  ItemArchiveUseCase,
  ItemCreateUseCase,
  ItemGetManyUseCase,
  ItemGetOneUseCase,
  ItemRenameUseCase,
} from '../../application';
import { ItemCreateRequestDto } from '../dto/item-create-request.dto';
import { ItemGetManyRequestDto } from '../dto/item-get-many-request.dto';
import { ItemIdRequestDto } from '../dto/item-id-request.dto';
import { ItemPageResponseDto } from '../dto/item-page-response.dto';
import { ItemRenameRequestDto } from '../dto/item-rename-request.dto';
import { ItemResponseDto } from '../dto/item-response.dto';
import { ItemHttpExceptionFilter } from '../filters/item-http-exception.filter';

@ApiTags('Item')
@UseFilters(ItemHttpExceptionFilter)
@Controller('items')
export class ItemController {
  constructor(
    private readonly create: ItemCreateUseCase,
    private readonly getMany: ItemGetManyUseCase,
    private readonly getOne: ItemGetOneUseCase,
    private readonly rename: ItemRenameUseCase,
    private readonly archive: ItemArchiveUseCase,
  ) {}

  private static readScopeOf(user: IAuthCurrentUserView): Maybe<string> {
    return user.roles.includes(RoleEnum.ADMIN) ? undefined : user.id;
  }

  @Post()
  @RequiresPermission(PermissionCodeEnum.ITEM_WRITE)
  @ApiHeader({ name: 'Idempotency-Key', required: true, description: 'At most 128 characters' })
  @ApiOperation({ summary: 'Create an item (idempotent)' })
  @ApiCreatedResponse({ type: ItemResponseDto })
  public handleCreate(
    @Body() body: ItemCreateRequestDto,
    @CurrentUser() user: IAuthCurrentUserView,
    @IdempotencyKey() idempotencyKey: string,
  ): Promise<ItemResponseDto> {
    const { sku, name } = body;

    return this.create.execute({ sku, name, ownerId: user.id, idempotencyKey });
  }

  @Get()
  @RequiresPermission(PermissionCodeEnum.ITEM_READ)
  @ApiOperation({ summary: 'List the items visible to the caller, newest first' })
  @ApiOkResponse({ type: ItemPageResponseDto })
  public handleGetMany(
    @Query() query: ItemGetManyRequestDto,
    @CurrentUser() user: IAuthCurrentUserView,
  ): Promise<ItemPageResponseDto> {
    const { page, size } = query;
    const ownerId = ItemController.readScopeOf(user);

    return this.getMany.execute({ page, size, ownerId });
  }

  @Get(':itemId')
  @RequiresPermission(PermissionCodeEnum.ITEM_READ)
  @ApiOperation({ summary: 'Read one item' })
  @ApiOkResponse({ type: ItemResponseDto })
  public handleGetOne(
    @Param() params: ItemIdRequestDto,
    @CurrentUser() user: IAuthCurrentUserView,
  ): Promise<ItemResponseDto> {
    const { itemId } = params;
    const ownerId = ItemController.readScopeOf(user);

    return this.getOne.execute({ itemId, ownerId });
  }

  @Patch(':itemId/name')
  @RequiresPermission(PermissionCodeEnum.ITEM_WRITE)
  @ApiHeader({ name: 'If-Match', required: false, description: 'The item version, for OCC' })
  @ApiOperation({ summary: 'Rename an item (optimistic concurrency)' })
  @ApiOkResponse({ type: ItemResponseDto })
  public handleRename(
    @Param() params: ItemIdRequestDto,
    @Body() body: ItemRenameRequestDto,
    @CurrentUser() user: IAuthCurrentUserView,
    @IfMatch() expectedVersion: Maybe<number>,
  ): Promise<ItemResponseDto> {
    const { itemId } = params;
    const { name } = body;

    return this.rename.execute({ itemId, name, ownerId: user.id, expectedVersion });
  }

  @Patch(':itemId/archive')
  @RequiresPermission(PermissionCodeEnum.ITEM_ARCHIVE)
  @ApiHeader({ name: 'If-Match', required: false, description: 'The item version, for OCC' })
  @ApiOperation({ summary: 'Archive an item (optimistic concurrency)' })
  @ApiOkResponse({ type: ItemResponseDto })
  public handleArchive(
    @Param() params: ItemIdRequestDto,
    @CurrentUser() user: IAuthCurrentUserView,
    @IfMatch() expectedVersion: Maybe<number>,
  ): Promise<ItemResponseDto> {
    const { itemId } = params;

    return this.archive.execute({ itemId, ownerId: user.id, expectedVersion });
  }
}
