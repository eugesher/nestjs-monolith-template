import { Body, Controller, Get, Param, Post, Query, UseFilters } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '@acme-libs/auth';
import type { IAuthCurrentUserView } from '@acme-libs/contracts/auth';
import { IdempotencyKey } from '@acme-libs/http';
import { OrderGetManyUseCase, OrderGetOneUseCase, OrderPlaceUseCase } from '../../application';
import { OrderGetManyRequestDto } from '../dto/order-get-many-request.dto';
import { OrderIdRequestDto } from '../dto/order-id-request.dto';
import { OrderPlaceRequestDto } from '../dto/order-place-request.dto';
import { OrderResponseDto } from '../dto/order-response.dto';
import { OrderSummaryPageResponseDto } from '../dto/order-summary-page-response.dto';
import { OrderHttpExceptionFilter } from '../filters/order-http-exception.filter';

@ApiTags('Order')
@UseFilters(OrderHttpExceptionFilter)
@Controller('orders')
export class OrderController {
  constructor(
    private readonly place: OrderPlaceUseCase,
    private readonly getMany: OrderGetManyUseCase,
    private readonly getOne: OrderGetOneUseCase,
  ) {}

  @Post()
  @ApiHeader({ name: 'Idempotency-Key', required: true, description: 'At most 128 characters' })
  @ApiOperation({ summary: 'Place an order for active products in stock (idempotent)' })
  @ApiCreatedResponse({ type: OrderResponseDto })
  public handlePlace(
    @CurrentUser() user: IAuthCurrentUserView,
    @Body() body: OrderPlaceRequestDto,
    @IdempotencyKey() idempotencyKey: string,
  ): Promise<OrderResponseDto> {
    const { id: customerId } = user;
    const { productIds } = body;

    return this.place.execute({ customerId, productIds, idempotencyKey });
  }

  @Get()
  @ApiOperation({ summary: 'List the orders of the caller, newest first' })
  @ApiOkResponse({ type: OrderSummaryPageResponseDto })
  public handleGetMany(
    @CurrentUser() user: IAuthCurrentUserView,
    @Query() query: OrderGetManyRequestDto,
  ): Promise<OrderSummaryPageResponseDto> {
    const { id: customerId } = user;
    const { page, size } = query;

    return this.getMany.execute({ customerId, page, size });
  }

  @Get(':orderId')
  @ApiOperation({ summary: 'Read one order of the caller with its products' })
  @ApiOkResponse({ type: OrderResponseDto })
  public handleGetOne(
    @CurrentUser() user: IAuthCurrentUserView,
    @Param() params: OrderIdRequestDto,
  ): Promise<OrderResponseDto> {
    const { id: customerId } = user;
    const { orderId } = params;

    return this.getOne.execute({ customerId, orderId });
  }
}
