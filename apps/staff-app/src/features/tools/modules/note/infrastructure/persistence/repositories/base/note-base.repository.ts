import { IHostedRepository, IRepositoryHostPort } from '@acme-libs/contracts/database';
import { Note } from '@acme-staff/common/entities';

import { INoteWriteUpdateCommand } from '../../../../outbound';

export abstract class NoteBaseRepository {
  protected constructor(protected readonly repositoryHost: IRepositoryHostPort) {}

  protected get noteRepository(): IHostedRepository<Note> {
    return this.repositoryHost.getRepository(Note);
  }

  public async update(command: INoteWriteUpdateCommand): Promise<boolean> {
    const { id, versionAsRead, body, resolved, version } = command;
    const result = await this.noteRepository.update(
      { id, version: versionAsRead },
      { body, resolved, version },
    );

    return result.affected === 1;
  }
}
