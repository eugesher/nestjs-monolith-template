import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { OccRetryHelper } from '@acme-libs/toolkit';

import { NoteModel, NoteVersionMismatchException } from '../../domain';
import { NOTE_OCC_RETRY_ATTEMPTS_TOKEN } from '../../outbound';
import { NoteWriteConflictError } from '../errors/note-write-conflict.error';
import { INoteWriteCommand, INoteWriteReloadCommand } from '../interfaces';
import { NoteAccessService } from './note-access.service';

@Injectable()
export class NoteWriteService {
  constructor(
    private readonly accessService: NoteAccessService,
    @Inject(NOTE_OCC_RETRY_ATTEMPTS_TOKEN)
    private readonly occRetryAttempts: number,
    @InjectPinoLogger(NoteWriteService.name)
    private readonly logger: PinoLogger,
  ) {}

  public async run<T>(command: INoteWriteCommand, attempt: () => Promise<T>): Promise<T> {
    const { noteId } = command;

    return await OccRetryHelper.run(attempt, {
      subject: 'Note',
      logger: this.logger,
      maxAttempts: this.occRetryAttempts,
      isConflict: (error): error is NoteWriteConflictError =>
        error instanceof NoteWriteConflictError,
      retryContext: (conflict) => ({ noteId, currentVersion: conflict.currentVersion }),
      exhaustedContext: () => ({ noteId }),
      onExhausted: (conflict, attempts) => {
        throw new NoteVersionMismatchException(noteId, attempts, conflict.currentVersion);
      },
    });
  }

  public async reload(command: INoteWriteReloadCommand): Promise<NoteModel> {
    const { noteId, authorId, saved } = command;
    const note = await this.accessService.loadOwned({ noteId, authorId });

    if (!saved) {
      throw new NoteWriteConflictError(noteId, note.version);
    }

    return note;
  }
}
