import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { NoteModel } from '../../domain';
import { type INoteCreateRepositoryPort, NOTE_CREATE_REPOSITORY_PORT } from '../../outbound';
import { INoteCreateCommand, INoteView } from '../interfaces';
import { NoteViewMapper } from '../mappers/note-view.mapper';

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
    const note = NoteModel.create({ subjectType, subjectId, body, authorId });
    const created = await this.repository.insert(note);
    const view = NoteViewMapper.toView(created);

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
