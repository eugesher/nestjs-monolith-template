import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';

import {
  NOTE_CREATE_REPOSITORY_PORT,
  type INoteCreateInsertQuery,
  type INoteCreateRecord,
  type INoteCreateRepositoryPort,
} from '../../../outbound';
import { NotePersistenceHost } from '../host/note-persistence.host';

@Injectable()
export class NoteCreateRepository extends NotePersistenceHost implements INoteCreateRepositoryPort {
  public static readonly provider: ClassProvider<INoteCreateRepositoryPort> = {
    provide: NOTE_CREATE_REPOSITORY_PORT,
    useClass: NoteCreateRepository,
  };

  constructor(
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
  ) {
    super();
  }

  public async insert(query: INoteCreateInsertQuery): Promise<string> {
    return await this.noteRepository.insertOne(query);
  }

  public async findInserted(noteId: string): Promise<INoteCreateRecord> {
    return await this.createNoteBuilder().forInserted(noteId).getOneOrFail();
  }
}
