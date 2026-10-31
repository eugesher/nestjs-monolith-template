import { DomainException, Maybe } from '@acme-libs/toolkit';
import { NoteErrorCodeEnum } from '../enums/note-error-code.enum';

export class NoteDomainException extends DomainException {
  public readonly code: NoteErrorCodeEnum;
  public readonly details: Maybe<Readonly<Record<string, unknown>>>;

  constructor(
    code: NoteErrorCodeEnum,
    message: string,
    details?: Readonly<Record<string, unknown>>,
  ) {
    super(message);
    this.code = code;
    this.details = details;
  }
}
