import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { RepositoryHost } from '@acme-libs/database';
import { NoteRevision } from '@acme-staff/common/entities';

import { NoteRevisionModel } from '../../../domain';
import { type INoteEditRepositoryPort } from '../../../outbound';
import { NoteUpdateBaseRepository } from './base/note-update-base.repository';

@Injectable()
export class NoteEditRepository
  extends NoteUpdateBaseRepository
  implements INoteEditRepositoryPort
{
  constructor(repositoryHost: RepositoryHost) {
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
