import { Injectable } from '@nestjs/common';

import { NoteAccessService } from '../services/note-access.service';
import type { INoteGetOneCommand, INoteView } from '../interfaces';

@Injectable()
export class NoteGetOneUseCase {
  constructor(private readonly accessService: NoteAccessService) {}

  public async execute(command: INoteGetOneCommand): Promise<INoteView> {
    const { noteId, authorId } = command;
    const note = await this.accessService.loadOwned({ noteId, authorId });

    return note.toSnapshot();
  }
}
