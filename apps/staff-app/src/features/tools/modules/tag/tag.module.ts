import { Module } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';

import {
  TagAccessService,
  TagCreateUseCase,
  TagDeleteUseCase,
  TagGetManyUseCase,
  TagRenameUseCase,
} from './application';
import {
  TagAccessRepository,
  TagCreateRepository,
  TagDeleteRepository,
  TagGetManyRepository,
  TagRenameRepository,
} from './infrastructure';
import { TagController } from './presentation';

@Module({
  controllers: [TagController],
  providers: [
    HttpExceptionFilter,
    TagCreateUseCase,
    TagDeleteUseCase,
    TagGetManyUseCase,
    TagRenameUseCase,
    TagAccessService,
    TagAccessRepository.provider,
    TagCreateRepository.provider,
    TagDeleteRepository.provider,
    TagGetManyRepository.provider,
    TagRenameRepository.provider,
  ],
})
export class TagModule {}
