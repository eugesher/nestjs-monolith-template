import { DomainException, Maybe } from '@acme-libs/toolkit';

import { NoteErrorCodeEnum } from '../../enums/note-error-code.enum';

export abstract class NoteBaseException extends DomainException {
  public abstract override readonly code: NoteErrorCodeEnum;
  public readonly details: Maybe<Readonly<Record<string, unknown>>>;

  protected constructor(message: string, details?: Readonly<Record<string, unknown>>) {
    super(message);
    this.details = details;
  }
}
