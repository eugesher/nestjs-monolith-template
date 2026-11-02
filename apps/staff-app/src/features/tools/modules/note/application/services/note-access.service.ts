import { Inject, Injectable } from '@nestjs/common';

import { NoteModel, NoteNotFoundException } from '../../domain';
import { type INoteAccessRepositoryPort, NOTE_ACCESS_REPOSITORY_PORT } from '../../outbound';
import { INoteAccessLoadOwnedQuery } from '../interfaces';

@Injectable()
export class NoteAccessService {
  constructor(
    @Inject(NOTE_ACCESS_REPOSITORY_PORT)
    private readonly repository: INoteAccessRepositoryPort,
  ) {}

  public async loadOwned(query: INoteAccessLoadOwnedQuery): Promise<NoteModel> {
    const { noteId, authorId } = query;
    const note = await this.repository.findOwned({ noteId, authorId });

    if (!note) {
      throw new NoteNotFoundException(noteId);
    }

    return note;
  }
}
