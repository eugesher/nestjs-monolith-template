import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

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
    const draft = NoteModel.createDraft({ subjectType, subjectId, body, authorId });
    const noteId = await this.repository.insert(draft);
    const record = await this.repository.findInserted(noteId);
    const created = NoteModel.reconstitute(record);
    const view = created.toSnapshot();

    this.logger.info(
      {
        noteId: view.id,
        subjectType: view.subjectType,
        subjectId: view.subjectId,
        authorId,
      },
      'Note created',
    );

    return view;
  }
}
