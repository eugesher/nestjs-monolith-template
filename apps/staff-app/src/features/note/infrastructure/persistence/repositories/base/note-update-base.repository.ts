import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { Note } from '@acme-core/entities';
import { INoteWriteUpdateCommand } from '../../../../outbound';

export abstract class NoteUpdateBaseRepository {
  protected constructor(protected readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  protected get notes(): Repository<Note> {
    return this.txHost.tx.getRepository(Note);
  }

  public async update(command: INoteWriteUpdateCommand): Promise<boolean> {
    const { note, versionAsRead } = command;
    const result = await this.notes.update(
      { id: note.id, version: versionAsRead },
      { body: note.body, resolved: note.resolved, version: note.version },
    );

    return result.affected === 1;
  }
}
