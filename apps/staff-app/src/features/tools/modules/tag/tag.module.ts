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
import {
  TAG_ACCESS_REPOSITORY_PORT,
  TAG_CREATE_REPOSITORY_PORT,
  TAG_DELETE_REPOSITORY_PORT,
  TAG_GET_MANY_REPOSITORY_PORT,
  TAG_RENAME_REPOSITORY_PORT,
} from './outbound';
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
    { provide: TAG_ACCESS_REPOSITORY_PORT, useClass: TagAccessRepository },
    { provide: TAG_CREATE_REPOSITORY_PORT, useClass: TagCreateRepository },
    { provide: TAG_DELETE_REPOSITORY_PORT, useClass: TagDeleteRepository },
    { provide: TAG_GET_MANY_REPOSITORY_PORT, useClass: TagGetManyRepository },
    { provide: TAG_RENAME_REPOSITORY_PORT, useClass: TagRenameRepository },
  ],
})
export class TagModule {}
