import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { RepositoryHost } from '@acme-libs/database';
import { IPage } from '@acme-libs/toolkit';
import { NoteRevision } from '@acme-staff/common/entities';

import { NoteRevisionModel } from '../../../domain';
import { type INoteGetRevisionsRepositoryPort, INoteRevisionPageQuery } from '../../../outbound';
import { NoteRevisionMapper } from '../mappers/note-revision.mapper';

@Injectable()
export class NoteGetRevisionsRepository implements INoteGetRevisionsRepositoryPort {
  constructor(private readonly repositoryHost: RepositoryHost) {}

  private get noteRevisionRepository(): Repository<NoteRevision> {
    return this.repositoryHost.getRepository(NoteRevision);
  }

  public async listForNote(query: INoteRevisionPageQuery): Promise<IPage<NoteRevisionModel>> {
    const { page, size, noteId } = query;
    const [revisions, total] = await this.noteRevisionRepository.findAndCount({
      where: { noteId },
      order: { noteVersion: 'DESC' },
      skip: (page - 1) * size,
      take: size,
    });

    return {
      items: revisions.map((revision) => NoteRevisionMapper.toModel(revision)),
      total,
      page,
      size,
    };
  }
}
