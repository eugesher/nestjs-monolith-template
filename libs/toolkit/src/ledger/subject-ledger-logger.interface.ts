import { IReplayRetryLogger } from '../resilience/replay-retry-options.interface';

export interface ISubjectLedgerLogger extends IReplayRetryLogger {
  info(context: Record<string, unknown>, message: string): void;
}
