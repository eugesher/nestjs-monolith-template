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
import { NOTE_OCC_RETRY_ATTEMPTS_TOKEN } from './outbound';
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
    NoteAccessRepository.provider,
    NoteCreateRepository.provider,
    NoteEditRepository.provider,
    NoteGetManyRepository.provider,
    NoteGetRevisionsRepository.provider,
    NoteResolveRepository.provider,
    ConfigValueProvider.provide({
      provide: NOTE_OCC_RETRY_ATTEMPTS_TOKEN,
      property: 'OCC_RETRY_ATTEMPTS',
    }),
  ],
})
export class NoteModule {}
