import { Inject, Injectable } from '@nestjs/common';

import { IIdempotencyCommonReleaseCommand } from '@acme-customer-contracts/idempotency';
import {
  IDEMPOTENCY_COMMON_RELEASE_REPOSITORY_PORT,
  type IIdempotencyCommonReleaseRepositoryPort,
} from '../../outbound';

@Injectable()
export class IdempotencyCommonReleaseUseCase {
  constructor(
    @Inject(IDEMPOTENCY_COMMON_RELEASE_REPOSITORY_PORT)
    private readonly repository: IIdempotencyCommonReleaseRepositoryPort,
  ) {}

  public execute(command: IIdempotencyCommonReleaseCommand): Promise<void> {
    const { key } = command;

    return this.repository.deleteInFlight(key);
  }
}
