import { Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';

import {
  INoteGetManyRepositoryPort,
  INoteGetManyRecord,
  INoteGetManyListQuery,
} from '../../../outbound';
import { NotePersistenceHost } from '../host/note-persistence.host';

@Injectable()
export class NoteGetManyRepository
  extends NotePersistenceHost
  implements INoteGetManyRepositoryPort
{
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async list(query: INoteGetManyListQuery): Promise<INoteGetManyRecord> {
    return await this.createNoteBuilder().forList(query).getManyAndCount();
  }
}
