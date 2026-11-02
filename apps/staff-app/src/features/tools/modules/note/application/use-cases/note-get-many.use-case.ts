import { Inject, Injectable } from '@nestjs/common';

import { IPage, PaginationHelper } from '@acme-libs/toolkit';

import { NoteSubjectInvalidException } from '../../domain';
import { type INoteGetManyRepositoryPort, NOTE_GET_MANY_REPOSITORY_PORT } from '../../outbound';
import { INoteGetManyQuery, INoteView } from '../interfaces';

@Injectable()
export class NoteGetManyUseCase {
  constructor(
    @Inject(NOTE_GET_MANY_REPOSITORY_PORT)
    private readonly repository: INoteGetManyRepositoryPort,
  ) {}

  public async execute(query: INoteGetManyQuery): Promise<IPage<INoteView>> {
    const { page, size, subjectType, subjectId, resolved, authorId } = query;

    if ((subjectType === undefined) !== (subjectId === undefined)) {
      throw new NoteSubjectInvalidException();
    }

    const window = PaginationHelper.clampPageWindow(page, size);
    const result = await this.repository.list({
      ...window,
      subjectType,
      subjectId,
      resolved,
      authorId,
    });
    const items = result.items.map((note) => note.toView());

    return { items, total: result.total, page: result.page, size: result.size };
  }
}
