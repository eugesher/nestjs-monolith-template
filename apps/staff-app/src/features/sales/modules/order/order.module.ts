import { Module } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';
import { TagCommonModule } from '@acme-staff/common/modules/tag';

import {
  OrderGetManyUseCase,
  OrderGetOneUseCase,
  OrderGetTagsUseCase,
  OrderReplaceTagsUseCase,
} from './application';
import {
  OrderGetManyRepository,
  OrderGetOneRepository,
  OrderGetTagsRepository,
  OrderReplaceTagsRepository,
  OrderTagCommonAdapter,
} from './infrastructure';
import {
  ORDER_GET_MANY_REPOSITORY_PORT,
  ORDER_GET_ONE_REPOSITORY_PORT,
  ORDER_GET_TAGS_REPOSITORY_PORT,
  ORDER_REPLACE_TAGS_REPOSITORY_PORT,
  ORDER_TAG_PORT,
} from './outbound';
import { OrderController } from './presentation';

@Module({
  imports: [TagCommonModule],
  controllers: [OrderController],
  providers: [
    HttpExceptionFilter,
    OrderGetManyUseCase,
    OrderGetOneUseCase,
    OrderGetTagsUseCase,
    OrderReplaceTagsUseCase,
    { provide: ORDER_GET_MANY_REPOSITORY_PORT, useClass: OrderGetManyRepository },
    { provide: ORDER_GET_ONE_REPOSITORY_PORT, useClass: OrderGetOneRepository },
    { provide: ORDER_GET_TAGS_REPOSITORY_PORT, useClass: OrderGetTagsRepository },
    { provide: ORDER_REPLACE_TAGS_REPOSITORY_PORT, useClass: OrderReplaceTagsRepository },
    { provide: ORDER_TAG_PORT, useClass: OrderTagCommonAdapter },
  ],
})
export class OrderModule {}
