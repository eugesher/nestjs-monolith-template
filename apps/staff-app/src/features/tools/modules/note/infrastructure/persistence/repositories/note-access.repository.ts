import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { Nullable } from '@acme-libs/toolkit';
import { Note } from '@acme-staff/common/entities';

import {
  INoteAccessFindOwnedQuery,
  INoteAccessRepositoryPort,
  INoteAccessRecord,
} from '../../../outbound';

@Injectable()
export class NoteAccessRepository implements INoteAccessRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get noteRepository(): IHostedRepository<Note> {
    return this.repositoryHost.getRepository(Note);
  }

  public async findOwned(query: INoteAccessFindOwnedQuery): Promise<Nullable<INoteAccessRecord>> {
    const { noteId, authorId } = query;

    return await this.noteRepository
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
      .where('Note.id = :noteId', { noteId })
      .andWhere('Note.authorId = :authorId', { authorId })
      .getOne();
  }
}
