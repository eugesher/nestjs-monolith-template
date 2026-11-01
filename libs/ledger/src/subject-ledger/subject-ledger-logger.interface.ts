import { IReplayRetryLogger } from '@acme-libs-toolkit';

export interface ISubjectLedgerLogger extends IReplayRetryLogger {
  info(context: Record<string, unknown>, message: string): void;
}
