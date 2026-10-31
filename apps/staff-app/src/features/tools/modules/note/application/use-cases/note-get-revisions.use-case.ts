import { Inject, Injectable } from '@nestjs/common';

import { IPage, PaginationHelper } from '@acme-libs/toolkit';
import {
  type INoteGetRevisionsRepositoryPort,
  NOTE_GET_REVISIONS_REPOSITORY_PORT,
} from '../../outbound';
import { INoteGetRevisionsQuery, INoteRevisionView } from '../interfaces';
import { NoteRevisionViewMapper } from '../mappers/note-revision-view.mapper';
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
    const result = await this.repository.listForNote({ ...window, noteId });
    const items = result.items.map((revision) => NoteRevisionViewMapper.toView(revision));

    return { items, total: result.total, page: result.page, size: result.size };
  }
}
