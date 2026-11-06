import { Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';

import { INoteResolveRepositoryPort } from '../../../outbound';
import { NoteBaseRepository } from './base/note-base.repository';

@Injectable()
export class NoteResolveRepository
  extends NoteBaseRepository
  implements INoteResolveRepositoryPort
{
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }
}
