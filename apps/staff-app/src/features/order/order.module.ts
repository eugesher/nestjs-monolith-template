import { Module } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';
import { OrderGetManyUseCase, OrderGetOneUseCase } from './application';
import { OrderCrudRepository, OrderTypeOrmModule } from './infrastructure';
import { ORDER_CRUD_REPOSITORY_PORT } from './outbound';
import { OrderController } from './presentation';

@Module({
  imports: [OrderTypeOrmModule.forFeature()],
  controllers: [OrderController],
  providers: [
    HttpExceptionFilter,
    OrderGetManyUseCase,
    OrderGetOneUseCase,
    { provide: ORDER_CRUD_REPOSITORY_PORT, useClass: OrderCrudRepository },
  ],
})
export class OrderModule {}
