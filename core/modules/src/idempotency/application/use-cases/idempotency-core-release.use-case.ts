import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, type PinoLogger } from 'nestjs-pino';

import type { IIdempotencyCoreReleaseCommand } from '@acme-core/contracts/idempotency';

import {
  IDEMPOTENCY_CORE_RELEASE_REPOSITORY_PORT,
  type IIdempotencyCoreReleaseRepositoryPort,
} from '../../outbound';

@Injectable()
export class IdempotencyCoreReleaseUseCase {
  constructor(
    @Inject(IDEMPOTENCY_CORE_RELEASE_REPOSITORY_PORT)
    private readonly repository: IIdempotencyCoreReleaseRepositoryPort,
    @InjectPinoLogger(IdempotencyCoreReleaseUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IIdempotencyCoreReleaseCommand): Promise<void> {
    const { scope, key } = command;

    await this.repository.deleteInFlight({ scope, key });

    this.logger.info({ scope, key }, 'Idempotency claim released');
  }
}
