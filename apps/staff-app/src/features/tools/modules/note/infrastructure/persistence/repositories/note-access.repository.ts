import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { Nullable } from '@acme-libs/toolkit';

import {
  INoteAccessFindOwnedQuery,
  INoteAccessRepositoryPort,
  INoteAccessRecord,
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
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async findOwned(query: INoteAccessFindOwnedQuery): Promise<Nullable<INoteAccessRecord>> {
    return await this.createNoteBuilder().forOwned(query).getOne();
  }
}
