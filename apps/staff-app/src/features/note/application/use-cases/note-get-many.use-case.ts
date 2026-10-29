import { Inject, Injectable } from '@nestjs/common';

import { IPage, PaginationHelper } from '@acme-libs/toolkit';
import { NoteDomainException, NoteErrorCodeEnum } from '../../domain';
import { type INoteCrudRepositoryPort, NOTE_CRUD_REPOSITORY_PORT } from '../../outbound';
import { INoteGetManyQuery, INoteView } from '../interfaces';
import { NoteViewMapper } from '../mappers/note-view.mapper';

@Injectable()
export class NoteGetManyUseCase {
  constructor(
    @Inject(NOTE_CRUD_REPOSITORY_PORT)
    private readonly repository: INoteCrudRepositoryPort,
  ) {}

  public async execute(query: INoteGetManyQuery): Promise<IPage<INoteView>> {
    const { page, size, subjectType, subjectId, resolved } = query;

    if ((subjectType === undefined) !== (subjectId === undefined)) {
      throw new NoteDomainException(
        NoteErrorCodeEnum.NOTE_SUBJECT_INVALID,
        'A subject filter needs both subjectType and subjectId, or neither',
      );
    }

    const window = PaginationHelper.clampPageWindow(page, size);
    const result = await this.repository.list({ ...window, subjectType, subjectId, resolved });
    const items = result.items.map((note) => NoteViewMapper.toView(note));

    return { items, total: result.total, page: result.page, size: result.size };
  }
}
