import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { NoteRevision } from '@acme-core/entities';
import { IPage } from '@acme-libs/toolkit';
import { NoteRevisionModel } from '../../../domain';
import { type INoteGetRevisionsRepositoryPort, INoteRevisionPageQuery } from '../../../outbound';
import { NoteRevisionMapper } from '../mappers/note-revision.mapper';

@Injectable()
export class NoteGetRevisionsRepository implements INoteGetRevisionsRepositoryPort {
  constructor(private readonly transactionHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get noteRevisionRepository(): Repository<NoteRevision> {
    return this.transactionHost.tx.getRepository(NoteRevision);
  }

  public async listForNote(query: INoteRevisionPageQuery): Promise<IPage<NoteRevisionModel>> {
    const { page, size, noteId } = query;
    const [revisions, total] = await this.noteRevisionRepository.findAndCount({
      where: { noteId },
      order: { noteVersion: 'DESC' },
      skip: (page - 1) * size,
      take: size,
    });

    return {
      items: revisions.map((revision) => NoteRevisionMapper.toModel(revision)),
      total,
      page,
      size,
    };
  }
}
