import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { IPage, PaginationHelper } from '@acme-libs/toolkit';
import { NoteRevision } from '@acme-staff/common/entities';

import { NoteRevisionModel } from '../../../domain';
import { INoteGetRevisionsRepositoryPort, INoteRevisionPageQuery } from '../../../outbound';

@Injectable()
export class NoteGetRevisionsRepository implements INoteGetRevisionsRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get noteRevisionRepository(): IHostedRepository<NoteRevision> {
    return this.repositoryHost.getRepository(NoteRevision);
  }

  public async listForNote(query: INoteRevisionPageQuery): Promise<IPage<NoteRevisionModel>> {
    const { page, size, noteId } = query;
    const [revisions, total] = await this.noteRevisionRepository
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
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();

    const data = revisions.map((revision) =>
      NoteRevisionModel.reconstitute({
        id: revision.id,
        noteId: revision.noteId,
        noteVersion: revision.noteVersion,
        bodyBefore: revision.bodyBefore,
        bodyAfter: revision.bodyAfter,
        editorId: revision.editorId,
        correlationId: revision.correlationId,
        recordedAt: revision.recordedAt,
      }),
    );

    return PaginationHelper.toPage(data, total, { page, size });
  }
}
