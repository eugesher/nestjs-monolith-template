import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { type ITransactionPort, TRANSACTION_PORT } from '@acme-libs/contracts/database';
import { CorrelationContextHelper } from '@acme-libs/observability';
import { NoteRevisionModel } from '../../domain';
import { type INoteEditRepositoryPort, NOTE_EDIT_REPOSITORY_PORT } from '../../outbound';
import { INoteEditCommand, INoteView } from '../interfaces';
import { INoteEditSaveCommand } from '../interfaces/commands/note-edit-save.command';
import { INoteEditOutcomeView } from '../interfaces/views/note-edit-outcome.view';
import { NoteViewMapper } from '../mappers/note-view.mapper';
import { NoteAccessService } from '../services/note-access.service';
import { NoteWriteService } from '../services/note-write.service';

@Injectable()
export class NoteEditUseCase {
  constructor(
    private readonly accessService: NoteAccessService,
    private readonly writeService: NoteWriteService,
    @Inject(NOTE_EDIT_REPOSITORY_PORT)
    private readonly repository: INoteEditRepositoryPort,
    @Inject(TRANSACTION_PORT)
    private readonly transaction: ITransactionPort,
    @InjectPinoLogger(NoteEditUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: INoteEditCommand): Promise<INoteView> {
    const { noteId, editorId } = command;
    const outcome = await this.writeService.run({ noteId }, () => this.attempt(command));
    const view = NoteViewMapper.toView(outcome.note);
    const message = outcome.edited ? 'Note edited' : 'Note edit was a no-op';

    this.logger.info({ noteId, editorId, version: view.version, edited: outcome.edited }, message);

    return view;
  }

  private async attempt(command: INoteEditCommand): Promise<INoteEditOutcomeView> {
    const { noteId, body, editorId } = command;
    const note = await this.accessService.loadOwned({ noteId, authorId: editorId });
    const versionAsRead = note.version;
    const bodyBefore = note.body;

    note.edit(body);

    if (note.version === versionAsRead) {
      return { note, edited: false };
    }

    const saved = await this.transaction.run(() =>
      this.save({ noteId, note, versionAsRead, bodyBefore, editorId }),
    );
    const stored = await this.writeService.reload({ noteId, authorId: editorId, saved });

    return { note: stored, edited: true };
  }

  private async save(command: INoteEditSaveCommand): Promise<boolean> {
    const { noteId, note, versionAsRead, bodyBefore, editorId } = command;
    const updated = await this.repository.update({ note, versionAsRead });

    if (!updated) {
      return false;
    }

    const correlationId = CorrelationContextHelper.current(NoteEditUseCase.name);
    const revision = NoteRevisionModel.create({
      noteId,
      noteVersion: note.version,
      bodyBefore,
      bodyAfter: note.body,
      editorId,
      correlationId,
    });

    await this.repository.appendRevision(revision);

    return true;
  }
}
