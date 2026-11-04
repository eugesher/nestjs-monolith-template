import { Inject, Injectable } from '@nestjs/common';

import { IPage, PaginationHelper } from '@acme-libs/toolkit';

import { NoteModel, NoteSubjectInvalidException } from '../../domain';
import { type INoteGetManyRepositoryPort, NOTE_GET_MANY_REPOSITORY_PORT } from '../../outbound';
import { INoteGetManyCommand, INoteView } from '../interfaces';

@Injectable()
export class NoteGetManyUseCase {
  constructor(
    @Inject(NOTE_GET_MANY_REPOSITORY_PORT)
    private readonly repository: INoteGetManyRepositoryPort,
  ) {}

  public async execute(command: INoteGetManyCommand): Promise<IPage<INoteView>> {
    const { page, limit, subjectType, subjectId, resolved, authorId } = command;

    if ((subjectType === undefined) !== (subjectId === undefined)) {
      throw new NoteSubjectInvalidException();
    }

    const pageWindow = PaginationHelper.clampPageWindow(page, limit);
    const [records, total] = await this.repository.list({
      ...pageWindow,
      subjectType,
      subjectId,
      resolved,
      authorId,
    });
    const data = records.map((record) => {
      const note = NoteModel.reconstitute(record);

      return note.toView();
    });

    return PaginationHelper.toPage(data, total, pageWindow);
  }
}
