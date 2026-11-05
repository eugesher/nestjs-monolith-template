import { Injectable } from '@nestjs/common';

import { INoteGetOneCommand, INoteView } from '../interfaces';
import { NoteAccessService } from '../services/note-access.service';

@Injectable()
export class NoteGetOneUseCase {
  constructor(private readonly accessService: NoteAccessService) {}

  public async execute(command: INoteGetOneCommand): Promise<INoteView> {
    const { noteId, authorId } = command;
    const note = await this.accessService.loadOwned({ noteId, authorId });

    return note.toView();
  }
}
