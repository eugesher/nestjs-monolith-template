import { Inject, Injectable } from '@nestjs/common';

import { NoteDomainException, NoteErrorCodeEnum, NoteModel } from '../../domain';
import { type INoteAccessRepositoryPort, NOTE_ACCESS_REPOSITORY_PORT } from '../../outbound';
import { INoteAccessLoadOwnedQuery } from '../interfaces/queries/note-access-load-owned.query';

@Injectable()
export class NoteAccessService {
  constructor(
    @Inject(NOTE_ACCESS_REPOSITORY_PORT)
    private readonly repository: INoteAccessRepositoryPort,
  ) {}

  public async loadOwned(query: INoteAccessLoadOwnedQuery): Promise<NoteModel> {
    const { noteId, authorId } = query;
    const note = await this.repository.findById(noteId);

    if (note?.authorId !== authorId) {
      throw new NoteDomainException(
        NoteErrorCodeEnum.NOTE_NOT_FOUND,
        `Note ${noteId} was not found`,
      );
    }

    return note;
  }
}
