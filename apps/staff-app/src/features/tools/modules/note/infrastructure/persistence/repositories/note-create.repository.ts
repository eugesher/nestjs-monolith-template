import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { Note } from '@acme-staff/common/entities';

import { INoteDraft, NoteModel } from '../../../domain';
import { INoteCreateRepositoryPort } from '../../../outbound';

@Injectable()
export class NoteCreateRepository implements INoteCreateRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get noteRepository(): IHostedRepository<Note> {
    return this.repositoryHost.getRepository(Note);
  }

  public async insert(draft: INoteDraft): Promise<NoteModel> {
    const { subjectType, subjectId, body, authorId, resolved, version } = draft;
    const id = await this.noteRepository.insertOne({
      subjectType,
      subjectId,
      body,
      authorId,
      resolved,
      version,
    });
    const stored = await this.noteRepository
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
      .where('Note.id = :id', { id })
      .getOneOrFail();

    return NoteModel.reconstitute({
      id: stored.id,
      subjectType: stored.subjectType,
      subjectId: stored.subjectId,
      body: stored.body,
      authorId: stored.authorId,
      resolved: stored.resolved,
      version: stored.version,
      createdAt: stored.createdAt,
      updatedAt: stored.updatedAt,
    });
  }
}
