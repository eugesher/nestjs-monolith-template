import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { Note } from '@acme-staff/common/entities';

import { NoteModel } from '../../../domain';
import { type INoteCreateRepositoryPort } from '../../../outbound';
import { NoteMapper } from '../mappers/note.mapper';

@Injectable()
export class NoteCreateRepository implements INoteCreateRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get noteRepository(): Repository<Note> {
    return this.repositoryHost.getRepository(Note);
  }

  public async insert(note: NoteModel): Promise<NoteModel> {
    const { subjectType, subjectId, body, authorId, resolved, version } = note;
    const result = await this.noteRepository.insert({
      subjectType,
      subjectId,
      body,
      authorId,
      resolved,
      version,
    });
    const [identifier] = result.identifiers as { id: number | string }[];
    const id = String(identifier.id);
    const stored = await this.noteRepository
      .createQueryBuilder('Note')
      .select([
        'Note.id',
        'Note.subjectType',
        'Note.subjectId',
        'Note.body',
        'Note.authorId',
        'Note.resolved',
        'Note.version',
        'Note.createdAt',
        'Note.updatedAt',
      ])
      .where('Note.id = :id', { id })
      .getOneOrFail();

    return NoteMapper.toModel(stored);
  }
}
