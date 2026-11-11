import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { CorrelationContextHelper } from '@acme-libs/observability';

import { NoteRevisionModel } from '../../domain';
import {
  NOTE_EDIT_REPOSITORY_PORT,
  NOTE_TRANSACTION_PORT,
  type INoteEditRepositoryPort,
  type INoteTransactionPort,
} from '../../outbound';
import { NoteAccessService } from '../services/note-access.service';
import { NoteWriteService } from '../services/note-write.service';
import type {
  INoteEditCommand,
  INoteEditOutcomeView,
  INoteEditSaveCommand,
  INoteView,
} from '../interfaces';

@Injectable()
export class NoteEditUseCase {
  constructor(
    private readonly accessService: NoteAccessService,
    private readonly writeService: NoteWriteService,
    @Inject(NOTE_EDIT_REPOSITORY_PORT)
    private readonly repository: INoteEditRepositoryPort,
    @Inject(NOTE_TRANSACTION_PORT)
    private readonly transaction: INoteTransactionPort,
    @InjectPinoLogger(NoteEditUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: INoteEditCommand): Promise<INoteView> {
    const { noteId, editorId } = command;
    const outcome = await this.writeService.run({ noteId }, () => this.attempt(command));
    const view = outcome.note.toSnapshot();
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
    const updated = await this.repository.update({
      id: note.id,
      versionAsRead,
      body: note.body,
      resolved: note.resolved,
      version: note.version,
    });

    if (!updated) {
      return false;
    }

    const correlationId = CorrelationContextHelper.current(NoteEditUseCase.name);
    const revision = NoteRevisionModel.createDraft({
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
