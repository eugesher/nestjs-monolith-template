import { randomUUID } from 'crypto';
import { PinoLogger } from 'nestjs-pino';

import { Maybe } from '@acme-libs/toolkit';
import { correlationStorage } from './correlation.storage';

export class CorrelationContextHelper {
  public static async run<T>(inbound: Maybe<string>, callback: () => Promise<T>): Promise<T> {
    const correlationId = inbound === undefined || inbound === '' ? randomUUID() : inbound;

    return await correlationStorage.run(correlationId, () => {
      if (!PinoLogger.root) {
        return callback();
      }

      const logger = new PinoLogger({});

      return logger.runInContext(callback, { bindings: { correlationId } });
    });
  }

  public static current(context: string): string {
    const correlationId = correlationStorage.getStore();

    if (correlationId) {
      return correlationId;
    }

    const minted = randomUUID();

    PinoLogger.root?.warn(
      { context, correlationId: minted },
      'No correlation context: the entry point does not open one, a new correlationId is minted',
    );

    return minted;
  }
}
