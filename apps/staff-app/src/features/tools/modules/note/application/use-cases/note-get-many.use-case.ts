import { Inject, Injectable } from '@nestjs/common';

import { PaginationHelper, type IPage } from '@acme-libs/toolkit';

import { NoteGetManyModel, NoteSubjectInvalidException } from '../../domain';
import { NOTE_GET_MANY_REPOSITORY_PORT, type INoteGetManyRepositoryPort } from '../../outbound';
import type { INoteGetManyCommand, INoteView } from '../interfaces';

@Injectable()
export class NoteGetManyUseCase {
  constructor(
    @Inject(NOTE_GET_MANY_REPOSITORY_PORT)
    private readonly repository: INoteGetManyRepositoryPort,
  ) {}

  public async execute(command: INoteGetManyCommand): Promise<IPage<INoteView>> {
    const { subjectType, subjectId, resolved, authorId } = command;

    if ((subjectType === undefined) !== (subjectId === undefined)) {
      throw new NoteSubjectInvalidException();
    }

    const { limit, offset, page } = PaginationHelper.clampPageWindow({ query: command });
    const [records, total] = await this.repository.list({
      limit,
      offset,
      subjectType,
      subjectId,
      resolved,
      authorId,
    });
    const data = NoteGetManyModel.toViewData(records);

    return PaginationHelper.toPage({ data, page, limit, total });
  }
}
