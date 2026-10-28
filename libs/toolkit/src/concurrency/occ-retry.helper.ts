import { IOccRetryPolicy } from './occ-retry-policy.interface';

export class OccRetryHelper {
  public static async run<T, TConflict>(
    attempt: () => Promise<T>,
    policy: IOccRetryPolicy<TConflict>,
  ): Promise<T> {
    const {
      subject,
      logger,
      maxAttempts,
      isConflict,
      retryContext,
      exhaustedContext,
      onExhausted,
    } = policy;

    for (let attemptNo = 1; attemptNo <= maxAttempts; attemptNo++) {
      try {
        return await attempt();
      } catch (error) {
        if (!isConflict(error)) {
          throw error;
        }

        if (attemptNo >= maxAttempts) {
          const context = exhaustedContext(error);

          logger.warn(
            { ...context, attempts: attemptNo, maxAttempts },
            `${subject} write conflict exhausted retry budget`,
          );
          onExhausted(error, attemptNo);
        }

        const context = retryContext(error);

        logger.info(
          { ...context, attempt: attemptNo, maxAttempts },
          `${subject} write conflict — retrying with a fresh read`,
        );
      }
    }

    throw new Error('OccRetryHelper.run: optimistic retry loop exited unexpectedly');
  }
}
