import { Module } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';
import { TagCommonModule } from '@acme-staff/common/modules';

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
  OrderTransactionAdapter,
} from './infrastructure';
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
    OrderGetManyRepository.provider,
    OrderGetOneRepository.provider,
    OrderGetTagsRepository.provider,
    OrderReplaceTagsRepository.provider,
    OrderTagCommonAdapter.provider,
    OrderTransactionAdapter.provider,
  ],
})
export class OrderModule {}
