import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';

import {
  INoteGetManyListQuery,
  INoteGetManyRecord,
  INoteGetManyRepositoryPort,
  NOTE_GET_MANY_REPOSITORY_PORT,
} from '../../../outbound';
import { NotePersistenceHost } from '../host/note-persistence.host';

@Injectable()
export class NoteGetManyRepository
  extends NotePersistenceHost
  implements INoteGetManyRepositoryPort
{
  public static readonly provider: ClassProvider<INoteGetManyRepositoryPort> = {
    provide: NOTE_GET_MANY_REPOSITORY_PORT,
    useClass: NoteGetManyRepository,
  };

  constructor(
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
  ) {
    super();
  }

  public async list(query: INoteGetManyListQuery): Promise<INoteGetManyRecord> {
    return await this.createNoteBuilder().forList(query).getManyAndCount();
  }
}
