import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { Nullable } from '@acme-libs/toolkit';
import { Note } from '@acme-staff/common/entities';

import { NoteModel } from '../../../domain';
import { INoteAccessFindOwnedQuery, type INoteAccessRepositoryPort } from '../../../outbound';
import { NoteMapper } from '../mappers/note.mapper';

@Injectable()
export class NoteAccessRepository implements INoteAccessRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get noteRepository(): Repository<Note> {
    return this.repositoryHost.getRepository(Note);
  }

  public async findOwned(query: INoteAccessFindOwnedQuery): Promise<Nullable<NoteModel>> {
    const { noteId, authorId } = query;
    const note = await this.noteRepository.findOne({ where: { id: noteId, authorId } });

    return note === null ? null : NoteMapper.toModel(note);
  }
}
