import { randomUUID } from 'crypto';
import { CLS_ID, ClsServiceManager } from 'nestjs-cls';
import { PinoLogger } from 'nestjs-pino';

import type { Maybe } from '@acme-libs/toolkit';

export class CorrelationContextHelper {
  public static async run<T>(inbound: Maybe<string>, callback: () => Promise<T>): Promise<T> {
    const correlationId = inbound === undefined || inbound === '' ? randomUUID() : inbound;
    const cls = ClsServiceManager.getClsService();

    return await cls.run({ ifNested: 'override' }, () => {
      cls.set(CLS_ID, correlationId);

      return callback();
    });
  }

  public static current(context: string): string {
    const correlationId: Maybe<string> = ClsServiceManager.getClsService().getId();

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
