import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, type PinoLogger } from 'nestjs-pino';

import { NoteModel } from '../../domain';
import { NOTE_CREATE_REPOSITORY_PORT, type INoteCreateRepositoryPort } from '../../outbound';
import type { INoteCreateCommand, INoteView } from '../interfaces';

@Injectable()
export class NoteCreateUseCase {
  constructor(
    @Inject(NOTE_CREATE_REPOSITORY_PORT)
    private readonly repository: INoteCreateRepositoryPort,
    @InjectPinoLogger(NoteCreateUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: INoteCreateCommand): Promise<INoteView> {
    const { subjectType, subjectId, body, authorId } = command;
    const noteDraft = NoteModel.createDraft({ subjectType, subjectId, body, authorId });
    const noteId = await this.repository.insert(noteDraft);
    const noteRecord = await this.repository.findInserted(noteId);
    const createdNote = NoteModel.reconstitute(noteRecord);
    const noteView = createdNote.toSnapshot();

    this.logger.info(
      {
        noteId: noteView.id,
        subjectType: noteView.subjectType,
        subjectId: noteView.subjectId,
        authorId,
      },
      'Note created',
    );

    return noteView;
  }
}
