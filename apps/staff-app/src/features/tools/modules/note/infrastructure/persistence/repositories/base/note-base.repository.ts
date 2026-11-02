import { Repository } from 'typeorm';

import { IRepositoryHostPort } from '@acme-libs/contracts/database';
import { Note } from '@acme-staff/common/entities';

import { INoteWriteUpdateCommand } from '../../../../outbound';

export abstract class NoteBaseRepository {
  protected constructor(protected readonly repositoryHost: IRepositoryHostPort) {}

  protected get noteRepository(): Repository<Note> {
    return this.repositoryHost.getRepository(Note);
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
