import { randomUUID } from 'crypto';
import { CLS_ID, ClsServiceManager } from 'nestjs-cls';
import { PinoLogger } from 'nestjs-pino';

import type { Maybe } from '@acme-libs/toolkit';

import { CorrelationIdHelper } from './correlation-id.helper';

export class CorrelationContextHelper {
  public static async run<T>(inbound: Maybe<string>, callback: () => Promise<T>): Promise<T> {
    const correlationId = CorrelationIdHelper.fromInbound(inbound);
    const cls = ClsServiceManager.getClsService();

    return await cls.run({ ifNested: 'override' }, () => {
      cls.set(CLS_ID, correlationId);

      return callback();
    });
  }

  public static current(context: string): string {
    const correlationId = ClsServiceManager.getClsService().getId() as Maybe<string>;

    if (correlationId) {
      return correlationId;
    }

    const mintedId = randomUUID();

    (PinoLogger.root as Maybe<typeof PinoLogger.root>)?.warn(
      { context, correlationId: mintedId },
      'No correlation context: the entry point does not open one, a new correlationId is minted',
    );

    return mintedId;
  }
}
