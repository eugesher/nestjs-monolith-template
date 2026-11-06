import { Module } from '@nestjs/common';

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
  NoteConfigOccRetryAttemptsProvider,
  NoteCreateRepository,
  NoteEditRepository,
  NoteGetManyRepository,
  NoteGetRevisionsRepository,
  NoteResolveRepository,
} from './infrastructure';
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
    NoteConfigOccRetryAttemptsProvider,
  ],
})
export class NoteModule {}
