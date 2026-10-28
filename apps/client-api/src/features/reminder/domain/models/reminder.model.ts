import { ReminderStatusEnum } from '@acme-libs/kernel';
import { AggregateRoot, Maybe } from '@acme-libs/toolkit';
import { ReminderErrorCodeEnum } from '../enums/reminder-error-code.enum';
import { ReminderDomainException } from '../exceptions/reminder-domain.exception';
import { IReminderDraft } from '../interfaces/reminder-draft.interface';
import { IReminderRecord } from '../interfaces/reminder-record.interface';

export class ReminderModel extends AggregateRoot<Maybe<string>> {
  private static readonly TITLE_MAX_LENGTH = 255;
  private static readonly BODY_MAX_LENGTH = 2000;
  private static readonly DUE_ON_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

  private constructor(
    id: Maybe<string>,
    public readonly ownerId: string,
    public readonly title: string,
    public readonly body: string,
    private currentDueOn: string,
    private currentStatus: ReminderStatusEnum,
    private currentVersion: number,
    public readonly createdAt: Maybe<Date>,
    public readonly updatedAt: Maybe<Date>,
  ) {
    super(id);
  }

  public static create(draft: IReminderDraft): ReminderModel {
    const { ownerId, title, body, dueOn } = draft;
    const validTitle = ReminderModel.validTitle(title);
    const validBody = ReminderModel.validBody(body);
    const validDueOn = ReminderModel.validDueOn(dueOn);

    return new ReminderModel(
      undefined,
      ownerId,
      validTitle,
      validBody,
      validDueOn,
      ReminderStatusEnum.PENDING,
      1,
      undefined,
      undefined,
    );
  }

  public static reconstitute(record: IReminderRecord): ReminderModel {
    const { id, ownerId, title, body, dueOn, status, version, createdAt, updatedAt } = record;
    const validTitle = ReminderModel.validTitle(title);
    const validBody = ReminderModel.validBody(body);
    const validDueOn = ReminderModel.validDueOn(dueOn);
    const validVersion = ReminderModel.validVersion(version);

    return new ReminderModel(
      id,
      ownerId,
      validTitle,
      validBody,
      validDueOn,
      status,
      validVersion,
      createdAt,
      updatedAt,
    );
  }

  private static validTitle(title: string): string {
    const trimmed = title.trim();

    if (trimmed.length === 0 || trimmed.length > ReminderModel.TITLE_MAX_LENGTH) {
      throw new ReminderDomainException(
        ReminderErrorCodeEnum.REMINDER_TITLE_INVALID,
        `Reminder.title must be a non-empty string of at most ${ReminderModel.TITLE_MAX_LENGTH} characters`,
      );
    }

    return trimmed;
  }

  private static validBody(body: string): string {
    const trimmed = body.trim();

    if (trimmed.length > ReminderModel.BODY_MAX_LENGTH) {
      throw new ReminderDomainException(
        ReminderErrorCodeEnum.REMINDER_BODY_INVALID,
        `Reminder.body must be at most ${ReminderModel.BODY_MAX_LENGTH} characters`,
      );
    }

    return trimmed;
  }

  private static validDueOn(dueOn: string): string {
    if (!ReminderModel.DUE_ON_PATTERN.test(dueOn)) {
      throw new ReminderDomainException(
        ReminderErrorCodeEnum.REMINDER_DUE_ON_INVALID,
        `Reminder.dueOn must be a calendar date formatted YYYY-MM-DD, got ${dueOn}`,
      );
    }

    const parsed = new Date(`${dueOn}T00:00:00.000Z`);

    if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== dueOn) {
      throw new ReminderDomainException(
        ReminderErrorCodeEnum.REMINDER_DUE_ON_INVALID,
        `Reminder.dueOn is not a real calendar date: ${dueOn}`,
      );
    }

    return dueOn;
  }

  private static validVersion(version: number): number {
    if (!Number.isInteger(version) || version < 1) {
      throw new ReminderDomainException(
        ReminderErrorCodeEnum.REMINDER_VERSION_INVALID,
        `Reminder.version must be a positive integer, got ${version}`,
      );
    }

    return version;
  }

  public get dueOn(): string {
    return this.currentDueOn;
  }

  public get status(): ReminderStatusEnum {
    return this.currentStatus;
  }

  public get version(): number {
    return this.currentVersion;
  }

  public complete(): void {
    this.assertPending();

    this.currentStatus = ReminderStatusEnum.DONE;
    this.currentVersion += 1;
  }

  public reschedule(dueOn: string): void {
    this.assertPending();

    const validDueOn = ReminderModel.validDueOn(dueOn);

    if (validDueOn === this.currentDueOn) {
      return;
    }

    this.currentDueOn = validDueOn;
    this.currentVersion += 1;
  }

  private assertPending(): void {
    if (this.currentStatus === ReminderStatusEnum.DONE) {
      throw new ReminderDomainException(
        ReminderErrorCodeEnum.REMINDER_ALREADY_DONE,
        `Reminder ${String(this.id)} is already done`,
      );
    }
  }
}
