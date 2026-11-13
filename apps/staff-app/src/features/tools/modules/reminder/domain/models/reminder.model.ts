import { ReminderStatusEnum } from '@acme-libs/kernel';
import { AggregateRootBase } from '@acme-libs/toolkit';

import { ReminderAlreadyDoneException } from '../exceptions/reminder-already-done.exception';
import { ReminderBodyInvalidException } from '../exceptions/reminder-body-invalid.exception';
import { ReminderDueOnInvalidException } from '../exceptions/reminder-due-on-invalid.exception';
import { ReminderTitleInvalidException } from '../exceptions/reminder-title-invalid.exception';
import { ReminderVersionInvalidException } from '../exceptions/reminder-version-invalid.exception';
import type {
  IReminderCandidateInput,
  IReminderDraftOutput,
  IReminderRecordInput,
  IReminderSnapshotOutput,
} from '../interfaces';

export class ReminderModel extends AggregateRootBase<string> {
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

  public static reconstitute(record: IReminderRecordInput): ReminderModel {
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

  public static createDraft(candidate: IReminderCandidateInput): IReminderDraftOutput {
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

  public toSnapshot(): IReminderSnapshotOutput {
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
    const trimmedTitle = title.trim();

    if (trimmedTitle.length === 0 || trimmedTitle.length > ReminderModel.TITLE_MAX_LENGTH) {
      throw new ReminderTitleInvalidException(ReminderModel.TITLE_MAX_LENGTH);
    }

    return trimmedTitle;
  }

  private static validBody(body: string): string {
    const trimmedBody = body.trim();

    if (trimmedBody.length > ReminderModel.BODY_MAX_LENGTH) {
      throw new ReminderBodyInvalidException(ReminderModel.BODY_MAX_LENGTH);
    }

    return trimmedBody;
  }

  private static validDueOn(dueOn: string): string {
    if (!ReminderModel.DUE_ON_PATTERN.test(dueOn)) {
      throw new ReminderDueOnInvalidException(dueOn);
    }

    const parsedDueOn = new Date(`${dueOn}T00:00:00.000Z`);

    if (Number.isNaN(parsedDueOn.getTime()) || parsedDueOn.toISOString().slice(0, 10) !== dueOn) {
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
