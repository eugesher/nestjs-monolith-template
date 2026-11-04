import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { Note } from '@acme-staff/common/entities';

import {
  INoteGetManyRepositoryPort,
  INoteGetManyRecord,
  INoteGetManyListQuery,
} from '../../../outbound';

@Injectable()
export class NoteGetManyRepository implements INoteGetManyRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get noteRepository(): IHostedRepository<Note> {
    return this.repositoryHost.getRepository(Note);
  }

  public async list(query: INoteGetManyListQuery): Promise<INoteGetManyRecord> {
    const { limit, offset, subjectType, subjectId, resolved, authorId } = query;
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

    return await builder.orderBy('Note.id', 'DESC').skip(offset).take(limit).getManyAndCount();
  }
}
