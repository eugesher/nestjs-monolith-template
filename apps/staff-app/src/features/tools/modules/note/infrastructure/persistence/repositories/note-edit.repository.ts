import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { NoteRevision } from '@acme-staff/common/entities';

import { INoteEditRepositoryPort, INoteRevisionInsertQuery } from '../../../outbound';
import { NoteBaseRepository } from './base/note-base.repository';

@Injectable()
export class NoteEditRepository extends NoteBaseRepository implements INoteEditRepositoryPort {
  constructor(@Inject(REPOSITORY_HOST_PORT) repositoryHost: IRepositoryHostPort) {
    super(repositoryHost);
  }

  private get noteRevisionRepository(): IHostedRepository<NoteRevision> {
    return this.repositoryHost.getRepository(NoteRevision);
  }

  public async appendRevision(query: INoteRevisionInsertQuery): Promise<void> {
    await this.noteRevisionRepository.insert(query);
  }
}
