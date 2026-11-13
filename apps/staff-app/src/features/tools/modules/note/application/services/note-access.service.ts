import { Inject, Injectable } from '@nestjs/common';

import { NoteModel, NoteNotFoundException } from '../../domain';
import { NOTE_ACCESS_REPOSITORY_PORT, type INoteAccessRepositoryPort } from '../../outbound';
import type { INoteAccessLoadOwnedCommand } from '../interfaces';

@Injectable()
export class NoteAccessService {
  constructor(
    @Inject(NOTE_ACCESS_REPOSITORY_PORT)
    private readonly repository: INoteAccessRepositoryPort,
  ) {}

  public async loadOwned(command: INoteAccessLoadOwnedCommand): Promise<NoteModel> {
    const { noteId, authorId } = command;
    const noteRecord = await this.repository.findOwned({ noteId, authorId });

    if (!noteRecord) {
      throw new NoteNotFoundException(noteId);
    }

    return NoteModel.reconstitute(noteRecord);
  }
}
