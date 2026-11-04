import { Inject, Injectable } from '@nestjs/common';

import { IPage, PaginationHelper } from '@acme-libs/toolkit';

import { NoteRevisionModel } from '../../domain';
import {
  type INoteGetRevisionsRepositoryPort,
  NOTE_GET_REVISIONS_REPOSITORY_PORT,
} from '../../outbound';
import { INoteGetRevisionsCommand, INoteRevisionView } from '../interfaces';
import { NoteAccessService } from '../services/note-access.service';

@Injectable()
export class NoteGetRevisionsUseCase {
  constructor(
    private readonly accessService: NoteAccessService,
    @Inject(NOTE_GET_REVISIONS_REPOSITORY_PORT)
    private readonly repository: INoteGetRevisionsRepositoryPort,
  ) {}

  public async execute(command: INoteGetRevisionsCommand): Promise<IPage<INoteRevisionView>> {
    const { noteId, authorId, page, limit } = command;

    await this.accessService.loadOwned({ noteId, authorId });

    const pageWindow = PaginationHelper.clampPageWindow(page, limit);
    const [records, total] = await this.repository.listForNote({ ...pageWindow, noteId });
    const data = records.map((record) => {
      const revision = NoteRevisionModel.reconstitute(record);

      return revision.toView();
    });

    return PaginationHelper.toPage(data, total, pageWindow);
  }
}
