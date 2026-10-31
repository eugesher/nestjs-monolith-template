import { Injectable } from '@nestjs/common';

import { INoteGetOneQuery, INoteView } from '../interfaces';
import { NoteViewMapper } from '../mappers/note-view.mapper';
import { NoteAccessService } from '../services/note-access.service';

@Injectable()
export class NoteGetOneUseCase {
  constructor(private readonly accessService: NoteAccessService) {}

  public async execute(query: INoteGetOneQuery): Promise<INoteView> {
    const { noteId, authorId } = query;
    const note = await this.accessService.loadOwned({ noteId, authorId });

    return NoteViewMapper.toView(note);
  }
}
