import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import {
  IIdempotencyCorePurgeExpiredCommand,
  IIdempotencyCorePurgeExpiredView,
} from '@acme-core/contracts/idempotency';
import { IdempotencyCoreKeyModel } from '../../domain';
import {
  IDEMPOTENCY_CORE_PURGE_EXPIRED_REPOSITORY_PORT,
  type IIdempotencyCorePurgeExpiredRepositoryPort,
} from '../../outbound';

@Injectable()
export class IdempotencyCorePurgeExpiredUseCase {
  constructor(
    @Inject(IDEMPOTENCY_CORE_PURGE_EXPIRED_REPOSITORY_PORT)
    private readonly repository: IIdempotencyCorePurgeExpiredRepositoryPort,
    @InjectPinoLogger(IdempotencyCorePurgeExpiredUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(
    command: IIdempotencyCorePurgeExpiredCommand,
  ): Promise<IIdempotencyCorePurgeExpiredView> {
    const { ttlHours } = command;
    const now = new Date();
    const cutoff = IdempotencyCoreKeyModel.expiryCutoff(now, ttlHours);
    const removed = await this.repository.deleteCreatedBefore(cutoff);

    this.logger.info(
      { cutoff: cutoff.toISOString(), removed, ttlHours },
      'Expired idempotency keys purged',
    );

    return { removed };
  }
}
