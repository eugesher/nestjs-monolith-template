import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';

import {
  NOTE_EDIT_REPOSITORY_PORT,
  type INoteEditRepositoryPort,
  type INoteEditRevisionInsertQuery,
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
