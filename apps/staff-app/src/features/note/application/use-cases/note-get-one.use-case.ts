import { Injectable } from '@nestjs/common';

import { INoteGetOneQuery, INoteView } from '../interfaces';
import { NoteViewMapper } from '../mappers/note-view.mapper';
import { NoteAccessService } from '../services/note-access.service';

@Injectable()
export class NoteGetOneUseCase {
  constructor(private readonly accessService: NoteAccessService) {}

  public async execute(query: INoteGetOneQuery): Promise<INoteView> {
    const { noteId } = query;
    const note = await this.accessService.load({ noteId });

    return NoteViewMapper.toView(note);
  }
}
