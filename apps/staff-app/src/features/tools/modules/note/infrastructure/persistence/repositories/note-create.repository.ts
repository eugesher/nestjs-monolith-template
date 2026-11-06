import { Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';

import {
  INoteCreateRepositoryPort,
  INoteCreateRecord,
  INoteCreateInsertQuery,
} from '../../../outbound';
import { NotePersistenceHost } from '../host/note-persistence.host';

@Injectable()
export class NoteCreateRepository extends NotePersistenceHost implements INoteCreateRepositoryPort {
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
