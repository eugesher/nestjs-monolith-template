import { Module } from '@nestjs/common';

import { ConfigProviderHelper } from '@acme-libs/config';
import { HttpExceptionFilter } from '@acme-libs/http';
import {
  NoteAccessService,
  NoteCreateUseCase,
  NoteEditUseCase,
  NoteGetManyUseCase,
  NoteGetOneUseCase,
  NoteGetRevisionsUseCase,
  NoteResolveUseCase,
  NoteWriteService,
} from './application';
import {
  NoteAccessRepository,
  NoteCreateRepository,
  NoteCrudRepository,
  NoteEditRepository,
  NoteGetRevisionsRepository,
  NoteResolveRepository,
  NoteTypeOrmModule,
} from './infrastructure';
import {
  NOTE_ACCESS_REPOSITORY_PORT,
  NOTE_CREATE_REPOSITORY_PORT,
  NOTE_CRUD_REPOSITORY_PORT,
  NOTE_EDIT_REPOSITORY_PORT,
  NOTE_GET_REVISIONS_REPOSITORY_PORT,
  NOTE_OCC_RETRY_ATTEMPTS,
  NOTE_RESOLVE_REPOSITORY_PORT,
} from './outbound';
import { NoteController } from './presentation';

@Module({
  imports: [NoteTypeOrmModule.forFeature()],
  controllers: [NoteController],
  providers: [
    HttpExceptionFilter,
    NoteCreateUseCase,
    NoteGetManyUseCase,
    NoteGetOneUseCase,
    NoteEditUseCase,
    NoteResolveUseCase,
    NoteGetRevisionsUseCase,
    NoteAccessService,
    NoteWriteService,
    { provide: NOTE_ACCESS_REPOSITORY_PORT, useClass: NoteAccessRepository },
    { provide: NOTE_CREATE_REPOSITORY_PORT, useClass: NoteCreateRepository },
    { provide: NOTE_CRUD_REPOSITORY_PORT, useClass: NoteCrudRepository },
    { provide: NOTE_EDIT_REPOSITORY_PORT, useClass: NoteEditRepository },
    { provide: NOTE_GET_REVISIONS_REPOSITORY_PORT, useClass: NoteGetRevisionsRepository },
    { provide: NOTE_RESOLVE_REPOSITORY_PORT, useClass: NoteResolveRepository },
    ConfigProviderHelper.value(NOTE_OCC_RETRY_ATTEMPTS, 'OCC_RETRY_ATTEMPTS'),
  ],
})
export class NoteModule {}
