import { Module } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';

import { OrderGetManyUseCase, OrderGetOneUseCase } from './application';
import { OrderGetManyRepository, OrderGetOneRepository } from './infrastructure';
import { ORDER_GET_MANY_REPOSITORY_PORT, ORDER_GET_ONE_REPOSITORY_PORT } from './outbound';
import { OrderController } from './presentation';

@Module({
  controllers: [OrderController],
  providers: [
    HttpExceptionFilter,
    OrderGetManyUseCase,
    OrderGetOneUseCase,
    { provide: ORDER_GET_MANY_REPOSITORY_PORT, useClass: OrderGetManyRepository },
    { provide: ORDER_GET_ONE_REPOSITORY_PORT, useClass: OrderGetOneRepository },
  ],
})
export class OrderModule {}
