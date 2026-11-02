import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { Nullable } from '@acme-libs/toolkit';
import { Note } from '@acme-staff/common/entities';

import { NoteModel } from '../../../domain';
import { INoteAccessFindOwnedQuery, INoteAccessRepositoryPort } from '../../../outbound';

@Injectable()
export class NoteAccessRepository implements INoteAccessRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get noteRepository(): Repository<Note> {
    return this.repositoryHost.getRepository(Note);
  }

  public async findOwned(query: INoteAccessFindOwnedQuery): Promise<Nullable<NoteModel>> {
    const { noteId, authorId } = query;
    const note = await this.noteRepository
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

    if (note === null) {
      return null;
    }

    return NoteModel.reconstitute({
      id: note.id,
      subjectType: note.subjectType,
      subjectId: note.subjectId,
      body: note.body,
      authorId: note.authorId,
      resolved: note.resolved,
      version: note.version,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    });
  }
}
