import { Inject, Injectable } from '@nestjs/common';

import { IIdempotencyCoreCompleteCommand } from '@acme-core/contracts/idempotency';
import {
  IDEMPOTENCY_CORE_COMPLETE_REPOSITORY_PORT,
  type IIdempotencyCoreCompleteRepositoryPort,
} from '../../outbound';

@Injectable()
export class IdempotencyCoreCompleteUseCase {
  constructor(
    @Inject(IDEMPOTENCY_CORE_COMPLETE_REPOSITORY_PORT)
    private readonly repository: IIdempotencyCoreCompleteRepositoryPort,
  ) {}

  public execute(command: IIdempotencyCoreCompleteCommand): Promise<void> {
    const { key, response } = command;
    const responseBody = JSON.stringify(response);

    return this.repository.complete({ key, responseBody });
  }
}
