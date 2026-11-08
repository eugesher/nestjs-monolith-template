import { ReminderStatusEnum } from '@acme-libs/kernel';
import { AggregateRoot } from '@acme-libs/toolkit';

import { ReminderAlreadyDoneException } from '../exceptions/reminder-already-done.exception';
import { ReminderBodyInvalidException } from '../exceptions/reminder-body-invalid.exception';
import { ReminderDueOnInvalidException } from '../exceptions/reminder-due-on-invalid.exception';
import { ReminderTitleInvalidException } from '../exceptions/reminder-title-invalid.exception';
import { ReminderVersionInvalidException } from '../exceptions/reminder-version-invalid.exception';
import { IReminderCandidate } from '../interfaces/reminder-candidate.interface';
import { IReminderDraft } from '../interfaces/reminder-draft.interface';
import { IReminderRecord } from '../interfaces/reminder-record.interface';
import { IReminderSnapshot } from '../interfaces/reminder-snapshot.interface';

export class ReminderModel extends AggregateRoot<string> {
  public get dueOn(): string {
    return this.currentDueOn;
  }

  public get status(): ReminderStatusEnum {
    return this.currentStatus;
  }

  public get version(): number {
    return this.currentVersion;
  }

  private static readonly TITLE_MAX_LENGTH = 255;
  private static readonly BODY_MAX_LENGTH = 2000;
  private static readonly DUE_ON_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

  private constructor(
    id: string,
    public readonly ownerId: string,
    public readonly title: string,
    public readonly body: string,
    private currentDueOn: string,
    private currentStatus: ReminderStatusEnum,
    private currentVersion: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {
    super(id);
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

  public static createDraft(candidate: IReminderCandidate): IReminderDraft {
    const { ownerId, title, body, dueOn } = candidate;
    const validTitle = ReminderModel.validTitle(title);
    const validBody = ReminderModel.validBody(body);
    const validDueOn = ReminderModel.validDueOn(dueOn);

    return {
      ownerId,
      title: validTitle,
      body: validBody,
      dueOn: validDueOn,
      status: ReminderStatusEnum.PENDING,
      version: 1,
    };
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

  public toView(): IReminderSnapshot {
    return {
      id: this.id,
      ownerId: this.ownerId,
      title: this.title,
      body: this.body,
      dueOn: this.dueOn,
      status: this.status,
      version: this.version,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  private static validTitle(title: string): string {
    const trimmed = title.trim();

    if (trimmed.length === 0 || trimmed.length > ReminderModel.TITLE_MAX_LENGTH) {
      throw new ReminderTitleInvalidException(ReminderModel.TITLE_MAX_LENGTH);
    }

    return trimmed;
  }

  private static validBody(body: string): string {
    const trimmed = body.trim();

    if (trimmed.length > ReminderModel.BODY_MAX_LENGTH) {
      throw new ReminderBodyInvalidException(ReminderModel.BODY_MAX_LENGTH);
    }

    return trimmed;
  }

  private static validDueOn(dueOn: string): string {
    if (!ReminderModel.DUE_ON_PATTERN.test(dueOn)) {
      throw new ReminderDueOnInvalidException(dueOn);
    }

    const parsed = new Date(`${dueOn}T00:00:00.000Z`);

    if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== dueOn) {
      throw new ReminderDueOnInvalidException(
        dueOn,
        `Reminder.dueOn is not a real calendar date: ${dueOn}`,
      );
    }

    return dueOn;
  }

  private static validVersion(version: number): number {
    if (!Number.isInteger(version) || version < 1) {
      throw new ReminderVersionInvalidException(version);
    }

    return version;
  }

  private assertPending(): void {
    if (this.currentStatus === ReminderStatusEnum.DONE) {
      throw new ReminderAlreadyDoneException(this.id);
    }
  }
}
