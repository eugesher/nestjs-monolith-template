import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';

import {
  INoteEditRepositoryPort,
  INoteEditRevisionInsertQuery,
  NOTE_EDIT_REPOSITORY_PORT,
} from '../../../outbound';
import { NoteBaseRepository } from './base/note-base.repository';

@Injectable()
export class NoteEditRepository extends NoteBaseRepository implements INoteEditRepositoryPort {
  public static readonly provider: ClassProvider<INoteEditRepositoryPort> = {
    provide: NOTE_EDIT_REPOSITORY_PORT,
    useClass: NoteEditRepository,
  };

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
