export interface IOccRetryLogger {
  info(context: Record<string, unknown>, message: string): void;
  warn(context: Record<string, unknown>, message: string): void;
}

export interface IOccRetryPolicy<TConflict> {
  subject: string;
  logger: IOccRetryLogger;
  maxAttempts: number;
  isConflict: (error: unknown) => error is TConflict;
  retryContext: (conflict: TConflict) => Record<string, unknown>;
  exhaustedContext: (conflict: TConflict) => Record<string, unknown>;
  onExhausted: (conflict: TConflict, attempts: number) => never;
}
