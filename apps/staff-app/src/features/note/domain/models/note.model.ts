import { AggregateRoot, Maybe } from '@acme-libs/toolkit';
import { NoteErrorCodeEnum } from '../enums/note-error-code.enum';
import { NoteDomainException } from '../exceptions/note-domain.exception';
import { INoteDraft } from '../interfaces/note-draft.interface';
import { INoteRecord } from '../interfaces/note-record.interface';

export class NoteModel extends AggregateRoot<Maybe<string>> {
  private static readonly SUBJECT_TYPE_PATTERN = /^[a-z][a-z-]{1,63}$/;
  private static readonly SUBJECT_ID_MAX_LENGTH = 64;
  private static readonly BODY_MAX_LENGTH = 4000;

  private constructor(
    id: Maybe<string>,
    public readonly subjectType: string,
    public readonly subjectId: string,
    private currentBody: string,
    public readonly authorId: string,
    private currentResolved: boolean,
    private currentVersion: number,
    public readonly createdAt: Maybe<Date>,
    public readonly updatedAt: Maybe<Date>,
  ) {
    super(id);
  }

  public static create(draft: INoteDraft): NoteModel {
    const { subjectType, subjectId, body, authorId } = draft;
    const validSubjectType = NoteModel.validSubjectType(subjectType);
    const validSubjectId = NoteModel.validSubjectId(subjectId);
    const validBody = NoteModel.validBody(body);

    return new NoteModel(
      undefined,
      validSubjectType,
      validSubjectId,
      validBody,
      authorId,
      false,
      1,
      undefined,
      undefined,
    );
  }

  public static reconstitute(record: INoteRecord): NoteModel {
    const { id, subjectType, subjectId, body, authorId, resolved, version, createdAt, updatedAt } =
      record;
    const validSubjectType = NoteModel.validSubjectType(subjectType);
    const validSubjectId = NoteModel.validSubjectId(subjectId);
    const validBody = NoteModel.validBody(body);
    const validVersion = NoteModel.validVersion(version);

    return new NoteModel(
      id,
      validSubjectType,
      validSubjectId,
      validBody,
      authorId,
      resolved,
      validVersion,
      createdAt,
      updatedAt,
    );
  }

  private static validSubjectType(subjectType: string): string {
    if (!NoteModel.SUBJECT_TYPE_PATTERN.test(subjectType)) {
      throw new NoteDomainException(
        NoteErrorCodeEnum.NOTE_SUBJECT_INVALID,
        `Note.subjectType must match ${String(NoteModel.SUBJECT_TYPE_PATTERN)}, got ${subjectType}`,
      );
    }

    return subjectType;
  }

  private static validSubjectId(subjectId: string): string {
    const trimmed = subjectId.trim();

    if (trimmed.length === 0 || trimmed.length > NoteModel.SUBJECT_ID_MAX_LENGTH) {
      throw new NoteDomainException(
        NoteErrorCodeEnum.NOTE_SUBJECT_INVALID,
        `Note.subjectId must be a non-empty string of at most ${NoteModel.SUBJECT_ID_MAX_LENGTH} characters`,
      );
    }

    return trimmed;
  }

  private static validBody(body: string): string {
    const trimmed = body.trim();

    if (trimmed.length === 0 || trimmed.length > NoteModel.BODY_MAX_LENGTH) {
      throw new NoteDomainException(
        NoteErrorCodeEnum.NOTE_BODY_INVALID,
        `Note.body must be a non-empty string of at most ${NoteModel.BODY_MAX_LENGTH} characters`,
      );
    }

    return trimmed;
  }

  private static validVersion(version: number): number {
    if (!Number.isInteger(version) || version < 1) {
      throw new NoteDomainException(
        NoteErrorCodeEnum.NOTE_VERSION_INVALID,
        `Note.version must be a positive integer, got ${version}`,
      );
    }

    return version;
  }

  public get body(): string {
    return this.currentBody;
  }

  public get resolved(): boolean {
    return this.currentResolved;
  }

  public get version(): number {
    return this.currentVersion;
  }

  public edit(body: string): void {
    this.assertOpen();

    const validBody = NoteModel.validBody(body);

    if (validBody === this.currentBody) {
      return;
    }

    this.currentBody = validBody;
    this.currentVersion += 1;
  }

  public resolve(): void {
    this.assertOpen();

    this.currentResolved = true;
    this.currentVersion += 1;
  }

  private assertOpen(): void {
    if (this.currentResolved) {
      throw new NoteDomainException(
        NoteErrorCodeEnum.NOTE_RESOLVED,
        `Note ${String(this.id)} is resolved and can no longer be modified`,
      );
    }
  }
}
