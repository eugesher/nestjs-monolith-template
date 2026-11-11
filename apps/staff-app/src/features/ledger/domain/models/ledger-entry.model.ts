import type { ILedgerEntryRecordInput, ILedgerEntrySnapshotOutput } from '../interfaces';

export class LedgerEntryModel {
  private constructor(
    public readonly id: string,
    public readonly operationKey: string,
    public readonly subjectType: string,
    public readonly subjectId: string,
    public readonly action: string,
    public readonly payload: Record<string, unknown>,
    public readonly correlationId: string,
    public readonly occurredAt: Date,
    public readonly recordedAt: Date,
  ) {}

  public static reconstitute(record: ILedgerEntryRecordInput): LedgerEntryModel {
    const {
      id,
      operationKey,
      subjectType,
      subjectId,
      action,
      payload,
      correlationId,
      occurredAt,
      recordedAt,
    } = record;

    return new LedgerEntryModel(
      id,
      operationKey,
      subjectType,
      subjectId,
      action,
      payload,
      correlationId,
      occurredAt,
      recordedAt,
    );
  }

  public toSnapshot(): ILedgerEntrySnapshotOutput {
    return {
      id: this.id,
      operationKey: this.operationKey,
      subjectType: this.subjectType,
      subjectId: this.subjectId,
      action: this.action,
      payload: this.payload,
      correlationId: this.correlationId,
      occurredAt: this.occurredAt.toISOString(),
      recordedAt: this.recordedAt.toISOString(),
    };
  }
}
