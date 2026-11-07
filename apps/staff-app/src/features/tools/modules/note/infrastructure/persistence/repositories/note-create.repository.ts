import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { REPOSITORY_HOST_PORT, type IRepositoryHostPort } from '@acme-libs/contracts/database';

import {
  INoteCreateInsertQuery,
  INoteCreateRecord,
  INoteCreateRepositoryPort,
  NOTE_CREATE_REPOSITORY_PORT,
} from '../../../outbound';
import { NotePersistenceHost } from '../host/note-persistence.host';

@Injectable()
export class NoteCreateRepository extends NotePersistenceHost implements INoteCreateRepositoryPort {
  public static readonly provider: ClassProvider<INoteCreateRepositoryPort> = {
    provide: NOTE_CREATE_REPOSITORY_PORT,
    useClass: NoteCreateRepository,
  };

  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
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
