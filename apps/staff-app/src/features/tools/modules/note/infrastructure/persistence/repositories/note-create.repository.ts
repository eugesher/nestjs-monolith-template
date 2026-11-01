import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { RepositoryHost } from '@acme-libs/database';
import { Note } from '@acme-staff/common/entities';

import { NoteModel } from '../../../domain';
import { type INoteCreateRepositoryPort } from '../../../outbound';
import { NoteMapper } from '../mappers/note.mapper';

@Injectable()
export class NoteCreateRepository implements INoteCreateRepositoryPort {
  constructor(private readonly repositoryHost: RepositoryHost) {}

  private get noteRepository(): Repository<Note> {
    return this.repositoryHost.getRepository(Note);
  }

  public async insert(note: NoteModel): Promise<NoteModel> {
    const { subjectType, subjectId, body, authorId, resolved, version } = note;
    const draft = this.noteRepository.create({
      subjectType,
      subjectId,
      body,
      authorId,
      resolved,
      version,
    });
    const saved = await this.noteRepository.save(draft);
    const stored = await this.noteRepository.findOneOrFail({ where: { id: String(saved.id) } });

    return NoteMapper.toModel(stored);
  }
}
