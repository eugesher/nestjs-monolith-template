import { IReplayRetryOptions } from './replay-retry-options.interface';

export class ReplayRetryHelper {
  public static async retryThenLogForReplay(
    operation: () => Promise<unknown>,
    options: IReplayRetryOptions,
  ): Promise<void> {
    const { maxAttempts, logger, correlationId, label, context, replayMessage } = options;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await operation();

        return;
      } catch (error) {
        if (attempt < maxAttempts) {
          logger.warn(
            { err: error, correlationId, attempt, ...context },
            `${label} failed — retrying`,
          );

          continue;
        }

        logger.error({ err: error, correlationId, ...context }, replayMessage);
      }
    }
  }
}
