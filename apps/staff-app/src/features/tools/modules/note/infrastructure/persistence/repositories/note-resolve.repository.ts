import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';

import { INoteResolveRepositoryPort, NOTE_RESOLVE_REPOSITORY_PORT } from '../../../outbound';
import { NoteBaseRepository } from './base/note-base.repository';

@Injectable()
export class NoteResolveRepository
  extends NoteBaseRepository
  implements INoteResolveRepositoryPort
{
  public static readonly provider: ClassProvider<INoteResolveRepositoryPort> = {
    provide: NOTE_RESOLVE_REPOSITORY_PORT,
    useClass: NoteResolveRepository,
  };

  constructor(
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
  ) {
    super();
  }
}
