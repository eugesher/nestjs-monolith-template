import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { IIdempotencyCommonPurgeExpiredView } from '@acme-customer-contracts/idempotency';
import { IdempotencyCommonKeyModel } from '../../domain';
import {
  IDEMPOTENCY_COMMON_KEY_TTL_HOURS,
  IDEMPOTENCY_COMMON_PURGE_EXPIRED_REPOSITORY_PORT,
  type IIdempotencyCommonPurgeExpiredRepositoryPort,
} from '../../outbound';

@Injectable()
export class IdempotencyCommonPurgeExpiredUseCase {
  constructor(
    @Inject(IDEMPOTENCY_COMMON_PURGE_EXPIRED_REPOSITORY_PORT)
    private readonly repository: IIdempotencyCommonPurgeExpiredRepositoryPort,
    @Inject(IDEMPOTENCY_COMMON_KEY_TTL_HOURS)
    private readonly ttlHours: number,
    @InjectPinoLogger(IdempotencyCommonPurgeExpiredUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(): Promise<IIdempotencyCommonPurgeExpiredView> {
    const now = new Date();
    const cutoff = IdempotencyCommonKeyModel.expiryCutoff(now, this.ttlHours);
    const removed = await this.repository.deleteCreatedBefore(cutoff);

    this.logger.info(
      { cutoff: cutoff.toISOString(), removed, ttlHours: this.ttlHours },
      'Expired idempotency keys purged',
    );

    return { removed };
  }
}
