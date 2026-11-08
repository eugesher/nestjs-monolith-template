import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { Nullable } from '@acme-libs/toolkit';
import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';

import {
  INoteAccessFindOwnedQuery,
  INoteAccessRecord,
  INoteAccessRepositoryPort,
  NOTE_ACCESS_REPOSITORY_PORT,
} from '../../../outbound';
import { NotePersistenceHost } from '../host/note-persistence.host';

@Injectable()
export class NoteAccessRepository extends NotePersistenceHost implements INoteAccessRepositoryPort {
  public static readonly provider: ClassProvider<INoteAccessRepositoryPort> = {
    provide: NOTE_ACCESS_REPOSITORY_PORT,
    useClass: NoteAccessRepository,
  };

  constructor(
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
  ) {
    super();
  }

  public async findOwned(query: INoteAccessFindOwnedQuery): Promise<Nullable<INoteAccessRecord>> {
    return await this.createNoteBuilder().forOwned(query).getOne();
  }
}
