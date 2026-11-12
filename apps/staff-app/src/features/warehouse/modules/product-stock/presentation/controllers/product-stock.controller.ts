import { Body, Controller, Param, Post, UseFilters } from '@nestjs/common';
import { ApiCreatedResponse, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser, RequiresPermission } from '@acme-libs/auth';
import { IdempotencyKey } from '@acme-libs/http';
import { PermissionCodeEnum } from '@acme-libs/kernel';
import type { IAuthCurrentUserView } from '@acme-libs/contracts/auth';

import { ProductStockAddUseCase } from '../../application';
import {
  ProductStockAddRequestDto,
  ProductStockProductIdParamDto,
  ProductStockResponseDto,
} from '../dto';
import { ProductStockHttpExceptionFilter } from '../filters/product-stock-http-exception.filter';

@ApiTags('Warehouse/ProductStock')
@UseFilters(ProductStockHttpExceptionFilter)
@Controller('warehouse/product-stock')
export class ProductStockController {
  constructor(private readonly add: ProductStockAddUseCase) {}

  @Post(':productId/add')
  @RequiresPermission(PermissionCodeEnum.PRODUCT_RESTOCK)
  @ApiHeader({ name: 'Idempotency-Key', required: true, description: 'At most 128 characters' })
  @ApiOperation({ summary: 'Add units to the stock of a product (idempotent)' })
  @ApiCreatedResponse({ type: ProductStockResponseDto })
  public async handleAdd(
    @CurrentUser() user: IAuthCurrentUserView,
    @Param() params: ProductStockProductIdParamDto,
    @Body() body: ProductStockAddRequestDto,
    @IdempotencyKey() idempotencyKey: string,
  ): Promise<ProductStockResponseDto> {
    const { id: staffUserId } = user;
    const { productId } = params;
    const { quantity } = body;

    return await this.add.execute({ productId, quantity, staffUserId, idempotencyKey });
  }
}
