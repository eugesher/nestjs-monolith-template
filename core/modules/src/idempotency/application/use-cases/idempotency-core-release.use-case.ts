import { Inject, Injectable } from '@nestjs/common';

import { IIdempotencyCoreReleaseCommand } from '@acme-core/contracts/idempotency';
import {
  IDEMPOTENCY_CORE_RELEASE_REPOSITORY_PORT,
  type IIdempotencyCoreReleaseRepositoryPort,
} from '../../outbound';

@Injectable()
export class IdempotencyCoreReleaseUseCase {
  constructor(
    @Inject(IDEMPOTENCY_CORE_RELEASE_REPOSITORY_PORT)
    private readonly repository: IIdempotencyCoreReleaseRepositoryPort,
  ) {}

  public execute(command: IIdempotencyCoreReleaseCommand): Promise<void> {
    const { key } = command;

    return this.repository.deleteInFlight(key);
  }
}
