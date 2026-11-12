export interface IReplayRetryLogger {
  warn(context: Record<string, unknown>, message: string): void;
  error(context: Record<string, unknown>, message: string): void;
}

export interface IReplayRetryOptions {
  maxAttempts: number;
  logger: IReplayRetryLogger;
  correlationId: string;
  label: string;
  context: Record<string, unknown>;
  replayMessage: string;
}
