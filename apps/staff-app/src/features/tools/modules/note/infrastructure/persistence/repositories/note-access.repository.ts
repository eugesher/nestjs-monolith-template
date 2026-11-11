import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';
import type { Nullable } from '@acme-libs/toolkit';

import {
  NOTE_ACCESS_REPOSITORY_PORT,
  type INoteAccessFindOwnedQuery,
  type INoteAccessRecord,
  type INoteAccessRepositoryPort,
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
