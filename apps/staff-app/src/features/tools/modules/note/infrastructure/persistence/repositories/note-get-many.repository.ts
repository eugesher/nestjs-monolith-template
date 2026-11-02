import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { IPage } from '@acme-libs/toolkit';
import { Note } from '@acme-staff/common/entities';

import { NoteModel } from '../../../domain';
import { INoteGetManyRepositoryPort, INotePageQuery } from '../../../outbound';

@Injectable()
export class NoteGetManyRepository implements INoteGetManyRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get noteRepository(): Repository<Note> {
    return this.repositoryHost.getRepository(Note);
  }

  public async list(query: INotePageQuery): Promise<IPage<NoteModel>> {
    const { page, size, subjectType, subjectId, resolved, authorId } = query;
    const builder = this.noteRepository
      .createQueryBuilder('Note')
      .select([
        'Note.id',
        'Note.subjectType',
        'Note.subjectId',
        'Note.body',
        'Note.authorId',
        'Note.resolved',
        'Note.version',
        'Note.createdAt',
        'Note.updatedAt',
      ])
      .where('Note.authorId = :authorId', { authorId });

    if (subjectType !== undefined) {
      builder
        .andWhere('Note.subjectType = :subjectType', { subjectType })
        .andWhere('Note.subjectId = :subjectId', { subjectId });
    }

    if (resolved !== undefined) {
      builder.andWhere('Note.resolved = :resolved', { resolved });
    }

    const [notes, total] = await builder
      .orderBy('Note.id', 'DESC')
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();

    return {
      items: notes.map((note) =>
        NoteModel.reconstitute({
          id: note.id,
          subjectType: note.subjectType,
          subjectId: note.subjectId,
          body: note.body,
          authorId: note.authorId,
          resolved: note.resolved,
          version: note.version,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
        }),
      ),
      total,
      page,
      size,
    };
  }
}
