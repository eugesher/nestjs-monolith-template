import { Inject, Injectable } from '@nestjs/common';

import { NoteDomainException, NoteErrorCodeEnum, NoteModel } from '../../domain';
import { type INoteAccessRepositoryPort, NOTE_ACCESS_REPOSITORY_PORT } from '../../outbound';
import { INoteAccessLoadQuery } from '../interfaces/queries/note-access-load.query';

@Injectable()
export class NoteAccessService {
  constructor(
    @Inject(NOTE_ACCESS_REPOSITORY_PORT)
    private readonly repository: INoteAccessRepositoryPort,
  ) {}

  public async load(query: INoteAccessLoadQuery): Promise<NoteModel> {
    const { noteId } = query;
    const note = await this.repository.findById(noteId);

    if (note === null) {
      throw new NoteDomainException(
        NoteErrorCodeEnum.NOTE_NOT_FOUND,
        `Note ${noteId} was not found`,
      );
    }

    return note;
  }
}
