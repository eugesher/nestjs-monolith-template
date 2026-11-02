import { Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';

import { INoteResolveRepositoryPort } from '../../../outbound';
import { NoteUpdateBaseRepository } from './base/note-update-base.repository';

@Injectable()
export class NoteResolveRepository
  extends NoteUpdateBaseRepository
  implements INoteResolveRepositoryPort
{
  constructor(@Inject(REPOSITORY_HOST_PORT) repositoryHost: IRepositoryHostPort) {
    super(repositoryHost);
  }
}
