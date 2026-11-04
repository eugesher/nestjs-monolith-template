import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { NoteRevision } from '@acme-staff/common/entities';

import {
  INoteGetRevisionsRepositoryPort,
  INoteGetRevisionsRecord,
  INoteGetRevisionsListForNoteQuery,
} from '../../../outbound';

@Injectable()
export class NoteGetRevisionsRepository implements INoteGetRevisionsRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get noteRevisionRepository(): IHostedRepository<NoteRevision> {
    return this.repositoryHost.getRepository(NoteRevision);
  }

  public async listForNote(
    query: INoteGetRevisionsListForNoteQuery,
  ): Promise<INoteGetRevisionsRecord> {
    const { limit, offset, noteId } = query;

    return await this.noteRevisionRepository
      .createQueryBuilder('NoteRevision')
      .select([
        'NoteRevision.id',
        'NoteRevision.noteId',
        'NoteRevision.noteVersion',
        'NoteRevision.bodyBefore',
        'NoteRevision.bodyAfter',
        'NoteRevision.editorId',
        'NoteRevision.correlationId',
        'NoteRevision.recordedAt',
      ])
      .where('NoteRevision.noteId = :noteId', { noteId })
      .orderBy('NoteRevision.noteVersion', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();
  }
}
