import type {
  ILedgerListEntriesRecordInput,
  ILedgerListEntriesSnapshotOutput,
} from '../interfaces';

export class LedgerListEntriesModel {
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

  public static reconstitute(record: ILedgerListEntriesRecordInput): LedgerListEntriesModel {
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

    return new LedgerListEntriesModel(
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

  public static toViewData(
    records: ILedgerListEntriesRecordInput[],
  ): ILedgerListEntriesSnapshotOutput[] {
    return records.map((record) => {
      const ledgerEntry = LedgerListEntriesModel.reconstitute(record);

      return ledgerEntry.toSnapshot();
    });
  }

  public toSnapshot(): ILedgerListEntriesSnapshotOutput {
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
