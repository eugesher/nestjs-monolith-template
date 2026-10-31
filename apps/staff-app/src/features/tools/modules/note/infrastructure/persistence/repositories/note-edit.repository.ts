import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { NoteRevision } from '@acme-core/entities';
import { NoteRevisionModel } from '../../../domain';
import { type INoteEditRepositoryPort } from '../../../outbound';
import { NoteUpdateBaseRepository } from './base/note-update-base.repository';

@Injectable()
export class NoteEditRepository
  extends NoteUpdateBaseRepository
  implements INoteEditRepositoryPort
{
  constructor(txHost: TransactionHost<TransactionalAdapterTypeOrm>) {
    super(txHost);
  }

  private get revisions(): Repository<NoteRevision> {
    return this.txHost.tx.getRepository(NoteRevision);
  }

  public async appendRevision(revision: NoteRevisionModel): Promise<void> {
    const { noteId, noteVersion, bodyBefore, bodyAfter, editorId, correlationId } = revision;

    await this.revisions.insert({
      noteId,
      noteVersion,
      bodyBefore,
      bodyAfter,
      editorId,
      correlationId,
    });
  }
}
