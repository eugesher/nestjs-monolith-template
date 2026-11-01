import { Injectable } from '@nestjs/common';

import { RepositoryHost } from '@acme-libs/database';

import { type INoteResolveRepositoryPort } from '../../../outbound';
import { NoteUpdateBaseRepository } from './base/note-update-base.repository';

@Injectable()
export class NoteResolveRepository
  extends NoteUpdateBaseRepository
  implements INoteResolveRepositoryPort
{
  constructor(repositoryHost: RepositoryHost) {
    super(repositoryHost);
  }
}
