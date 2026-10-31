import { Controller, Get, Param, Query, UseFilters } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RequiresPermission } from '@acme-libs/auth';
import { PermissionCodeEnum } from '@acme-libs/kernel';
import { OrderGetManyUseCase, OrderGetOneUseCase } from '../../application';
import { OrderGetManyRequestDto } from '../dto/order-get-many-request.dto';
import { OrderIdRequestDto } from '../dto/order-id-request.dto';
import { OrderResponseDto } from '../dto/order-response.dto';
import { OrderSummaryPageResponseDto } from '../dto/order-summary-page-response.dto';
import { OrderHttpExceptionFilter } from '../filters/order-http-exception.filter';

@ApiTags('Sales/Order')
@UseFilters(OrderHttpExceptionFilter)
@Controller('sales/orders')
export class OrderController {
  constructor(
    private readonly getMany: OrderGetManyUseCase,
    private readonly getOne: OrderGetOneUseCase,
  ) {}

  @Get()
  @RequiresPermission(PermissionCodeEnum.ORDER_READ)
  @ApiOperation({ summary: 'List the orders of all customers, newest first' })
  @ApiOkResponse({ type: OrderSummaryPageResponseDto })
  public async handleGetMany(
    @Query() query: OrderGetManyRequestDto,
  ): Promise<OrderSummaryPageResponseDto> {
    const { page, size } = query;

    return await this.getMany.execute({ page, size });
  }

  @Get(':orderId')
  @RequiresPermission(PermissionCodeEnum.ORDER_READ)
  @ApiOperation({ summary: 'Read one order with its products' })
  @ApiOkResponse({ type: OrderResponseDto })
  public async handleGetOne(@Param() params: OrderIdRequestDto): Promise<OrderResponseDto> {
    const { orderId } = params;

    return await this.getOne.execute({ orderId });
  }
}
