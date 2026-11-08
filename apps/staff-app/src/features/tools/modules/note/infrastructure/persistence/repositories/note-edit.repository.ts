import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';

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
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
  ) {
    super();
  }

  public async appendRevision(query: INoteEditRevisionInsertQuery): Promise<void> {
    await this.noteRevisionRepository.insert(query);
  }
}
