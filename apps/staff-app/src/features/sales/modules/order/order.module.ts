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
  ],
})
export class OrderModule {}
