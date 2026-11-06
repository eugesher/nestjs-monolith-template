import { Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';

import {
  INoteGetRevisionsRepositoryPort,
  INoteGetRevisionsRecord,
  INoteGetRevisionsListForNoteQuery,
} from '../../../outbound';
import { NotePersistenceHost } from '../host/note-persistence.host';

@Injectable()
export class NoteGetRevisionsRepository
  extends NotePersistenceHost
  implements INoteGetRevisionsRepositoryPort
{
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async listForNote(
    query: INoteGetRevisionsListForNoteQuery,
  ): Promise<INoteGetRevisionsRecord> {
    return await this.createNoteRevisionBuilder().forListForNote(query).getManyAndCount();
  }
}
