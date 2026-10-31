import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { Note } from '@acme-core/entities';
import { INoteWriteUpdateCommand } from '../../../../outbound';

export abstract class NoteUpdateBaseRepository {
  protected constructor(
    protected readonly transactionHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {}

  protected get noteRepository(): Repository<Note> {
    return this.transactionHost.tx.getRepository(Note);
  }

  public async update(command: INoteWriteUpdateCommand): Promise<boolean> {
    const { note, versionAsRead } = command;
    const result = await this.noteRepository.update(
      { id: note.id, version: versionAsRead },
      { body: note.body, resolved: note.resolved, version: note.version },
    );

    return result.affected === 1;
  }
}
