import { Body, Controller, Get, Param, Put, Query, UseFilters } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RequiresPermission } from '@acme-libs/auth';
import { PermissionCodeEnum } from '@acme-libs/kernel';

import {
  OrderGetManyUseCase,
  OrderGetOneUseCase,
  OrderGetTagsUseCase,
  OrderReplaceTagsUseCase,
} from '../../application';
import {
  OrderGetManyQueryDto,
  OrderIdParamDto,
  OrderResponseDto,
  OrderSummaryPageResponseDto,
  OrderTagsReplaceRequestDto,
  OrderTagsResponseDto,
} from '../dto';
import { OrderHttpExceptionFilter } from '../filters/order-http-exception.filter';

@ApiTags('Sales/Order')
@UseFilters(OrderHttpExceptionFilter)
@Controller('sales/orders')
export class OrderController {
  constructor(
    private readonly getMany: OrderGetManyUseCase,
    private readonly getOne: OrderGetOneUseCase,
    private readonly getTags: OrderGetTagsUseCase,
    private readonly replaceTags: OrderReplaceTagsUseCase,
  ) {}

  @Get()
  @RequiresPermission(PermissionCodeEnum.ORDER_READ)
  @ApiOperation({ summary: 'List the orders of all customers, newest first, optionally by tag' })
  @ApiOkResponse({ type: OrderSummaryPageResponseDto })
  public async handleGetMany(
    @Query() query: OrderGetManyQueryDto,
  ): Promise<OrderSummaryPageResponseDto> {
    const { page, limit, tagId } = query;

    return await this.getMany.execute({ page, limit, tagId });
  }

  @Get(':orderId')
  @RequiresPermission(PermissionCodeEnum.ORDER_READ)
  @ApiOperation({ summary: 'Read one order with its products' })
  @ApiOkResponse({ type: OrderResponseDto })
  public async handleGetOne(@Param() params: OrderIdParamDto): Promise<OrderResponseDto> {
    const { orderId } = params;

    return await this.getOne.execute({ orderId });
  }

  @Get(':orderId/tags')
  @RequiresPermission(PermissionCodeEnum.ORDER_READ)
  @ApiOperation({ summary: 'Read the tags of an order, by name' })
  @ApiOkResponse({ type: OrderTagsResponseDto })
  public async handleGetTags(@Param() params: OrderIdParamDto): Promise<OrderTagsResponseDto> {
    const { orderId } = params;

    return await this.getTags.execute({ orderId });
  }

  @Put(':orderId/tags')
  @RequiresPermission(PermissionCodeEnum.ORDER_WRITE)
  @ApiOperation({ summary: 'Replace the tags of an order' })
  @ApiOkResponse({ type: OrderTagsResponseDto })
  public async handleReplaceTags(
    @Param() params: OrderIdParamDto,
    @Body() body: OrderTagsReplaceRequestDto,
  ): Promise<OrderTagsResponseDto> {
    const { orderId } = params;
    const { tagIds } = body;

    return await this.replaceTags.execute({ orderId, tagIds });
  }
}
