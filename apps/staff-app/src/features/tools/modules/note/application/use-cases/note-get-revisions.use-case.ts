import { Inject, Injectable } from '@nestjs/common';

import { IPage, PaginationHelper } from '@acme-libs/toolkit';

import { NoteRevisionModel } from '../../domain';
import {
  type INoteGetRevisionsRepositoryPort,
  NOTE_GET_REVISIONS_REPOSITORY_PORT,
} from '../../outbound';
import { INoteGetRevisionsQuery, INoteRevisionView } from '../interfaces';
import { NoteAccessService } from '../services/note-access.service';

@Injectable()
export class NoteGetRevisionsUseCase {
  constructor(
    private readonly accessService: NoteAccessService,
    @Inject(NOTE_GET_REVISIONS_REPOSITORY_PORT)
    private readonly repository: INoteGetRevisionsRepositoryPort,
  ) {}

  public async execute(query: INoteGetRevisionsQuery): Promise<IPage<INoteRevisionView>> {
    const { noteId, authorId, page, size } = query;

    await this.accessService.loadOwned({ noteId, authorId });

    const window = PaginationHelper.clampPageWindow(page, size);
    const [records, total] = await this.repository.listForNote({ ...window, noteId });
    const data = records.map((record) => {
      const revision = NoteRevisionModel.reconstitute(record);

      return revision.toView();
    });

    return PaginationHelper.toPage(data, total, window);
  }
}
