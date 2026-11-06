import { Module } from '@nestjs/common';

import { ConfigValueProvider } from '@acme-libs/config';
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
  NoteEditRepository,
  NoteGetManyRepository,
  NoteGetRevisionsRepository,
  NoteResolveRepository,
} from './infrastructure';
import {
  NOTE_ACCESS_REPOSITORY_PORT,
  NOTE_CREATE_REPOSITORY_PORT,
  NOTE_EDIT_REPOSITORY_PORT,
  NOTE_GET_MANY_REPOSITORY_PORT,
  NOTE_GET_REVISIONS_REPOSITORY_PORT,
  NOTE_OCC_RETRY_ATTEMPTS,
  NOTE_RESOLVE_REPOSITORY_PORT,
} from './outbound';
import { NoteController } from './presentation';

@Module({
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
    { provide: NOTE_EDIT_REPOSITORY_PORT, useClass: NoteEditRepository },
    { provide: NOTE_GET_MANY_REPOSITORY_PORT, useClass: NoteGetManyRepository },
    { provide: NOTE_GET_REVISIONS_REPOSITORY_PORT, useClass: NoteGetRevisionsRepository },
    { provide: NOTE_RESOLVE_REPOSITORY_PORT, useClass: NoteResolveRepository },
    ConfigValueProvider.provide({
      provide: NOTE_OCC_RETRY_ATTEMPTS,
      property: 'OCC_RETRY_ATTEMPTS',
    }),
  ],
})
export class NoteModule {}
