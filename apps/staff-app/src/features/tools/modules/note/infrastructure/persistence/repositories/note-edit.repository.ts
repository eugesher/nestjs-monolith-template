import { Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';

import { INoteEditRepositoryPort, INoteEditRevisionInsertQuery } from '../../../outbound';
import { NoteBaseRepository } from './base/note-base.repository';

@Injectable()
export class NoteEditRepository extends NoteBaseRepository implements INoteEditRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async appendRevision(query: INoteEditRevisionInsertQuery): Promise<void> {
    await this.noteRevisionRepository.insert(query);
  }
}
