import { Inject, Injectable } from '@nestjs/common';

import { PaginationHelper } from '@acme-libs/toolkit';

import { NoteGetRevisionsModel } from '../../domain';
import {
  NOTE_GET_REVISIONS_REPOSITORY_PORT,
  type INoteGetRevisionsRepositoryPort,
} from '../../outbound';
import { NoteAccessService } from '../services/note-access.service';
import type { INoteGetRevisionsCommand, INoteGetRevisionsView } from '../interfaces';

@Injectable()
export class NoteGetRevisionsUseCase {
  constructor(
    private readonly accessService: NoteAccessService,
    @Inject(NOTE_GET_REVISIONS_REPOSITORY_PORT)
    private readonly repository: INoteGetRevisionsRepositoryPort,
  ) {}

  public async execute(command: INoteGetRevisionsCommand): Promise<INoteGetRevisionsView> {
    const { noteId, authorId } = command;

    await this.accessService.loadOwned({ noteId, authorId });

    const { limit, offset, page } = PaginationHelper.clampPageWindow({ query: command });
    const [records, total] = await this.repository.listForNote({ limit, offset, noteId });
    const data = NoteGetRevisionsModel.toViewData(records);

    return PaginationHelper.toPage({ data, page, limit, total });
  }
}
