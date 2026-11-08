import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';

import {
  INoteGetRevisionsListForNoteQuery,
  INoteGetRevisionsRecord,
  INoteGetRevisionsRepositoryPort,
  NOTE_GET_REVISIONS_REPOSITORY_PORT,
} from '../../../outbound';
import { NotePersistenceHost } from '../host/note-persistence.host';

@Injectable()
export class NoteGetRevisionsRepository
  extends NotePersistenceHost
  implements INoteGetRevisionsRepositoryPort
{
  public static readonly provider: ClassProvider<INoteGetRevisionsRepositoryPort> = {
    provide: NOTE_GET_REVISIONS_REPOSITORY_PORT,
    useClass: NoteGetRevisionsRepository,
  };

  constructor(
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
  ) {
    super();
  }

  public async listForNote(
    query: INoteGetRevisionsListForNoteQuery,
  ): Promise<INoteGetRevisionsRecord> {
    return await this.createNoteRevisionBuilder().forListForNote(query).getManyAndCount();
  }
}
