import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { NoteRevision } from '@acme-staff/common/entities';

import { NoteRevisionModel } from '../../../domain';
import { type INoteEditRepositoryPort } from '../../../outbound';
import { NoteUpdateBaseRepository } from './base/note-update-base.repository';

@Injectable()
export class NoteEditRepository
  extends NoteUpdateBaseRepository
  implements INoteEditRepositoryPort
{
  constructor(@Inject(REPOSITORY_HOST_PORT) repositoryHost: IRepositoryHostPort) {
    super(repositoryHost);
  }

  private get noteRevisionRepository(): Repository<NoteRevision> {
    return this.repositoryHost.getRepository(NoteRevision);
  }

  public async appendRevision(revision: NoteRevisionModel): Promise<void> {
    const { noteId, noteVersion, bodyBefore, bodyAfter, editorId, correlationId } = revision;

    await this.noteRevisionRepository.insert({
      noteId,
      noteVersion,
      bodyBefore,
      bodyAfter,
      editorId,
      correlationId,
    });
  }
}
