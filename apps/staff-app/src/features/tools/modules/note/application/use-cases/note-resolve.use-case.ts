import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { NoteModel } from '../../domain';
import { type INoteResolveRepositoryPort, NOTE_RESOLVE_REPOSITORY_PORT } from '../../outbound';
import { INoteResolveCommand, INoteView } from '../interfaces';
import { NoteViewMapper } from '../mappers/note-view.mapper';
import { NoteAccessService } from '../services/note-access.service';
import { NoteWriteService } from '../services/note-write.service';

@Injectable()
export class NoteResolveUseCase {
  constructor(
    private readonly accessService: NoteAccessService,
    private readonly writeService: NoteWriteService,
    @Inject(NOTE_RESOLVE_REPOSITORY_PORT)
    private readonly repository: INoteResolveRepositoryPort,
    @InjectPinoLogger(NoteResolveUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: INoteResolveCommand): Promise<INoteView> {
    const { noteId } = command;
    const resolved = await this.writeService.run({ noteId }, () => this.attempt(command));
    const view = NoteViewMapper.toView(resolved);

    this.logger.info({ noteId, version: view.version }, 'Note resolved');

    return view;
  }

  private async attempt(command: INoteResolveCommand): Promise<NoteModel> {
    const { noteId, authorId } = command;
    const note = await this.accessService.loadOwned({ noteId, authorId });
    const versionAsRead = note.version;

    note.resolve();

    const saved = await this.repository.update({ note, versionAsRead });

    return await this.writeService.reload({ noteId, authorId, saved });
  }
}
