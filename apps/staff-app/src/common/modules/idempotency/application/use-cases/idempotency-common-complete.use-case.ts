import { Inject, Injectable } from '@nestjs/common';

import { IIdempotencyCommonCompleteCommand } from '@acme-staff-contracts/idempotency';
import {
  IDEMPOTENCY_COMMON_COMPLETE_REPOSITORY_PORT,
  type IIdempotencyCommonCompleteRepositoryPort,
} from '../../outbound';

@Injectable()
export class IdempotencyCommonCompleteUseCase {
  constructor(
    @Inject(IDEMPOTENCY_COMMON_COMPLETE_REPOSITORY_PORT)
    private readonly repository: IIdempotencyCommonCompleteRepositoryPort,
  ) {}

  public execute(command: IIdempotencyCommonCompleteCommand): Promise<void> {
    const { key, response } = command;
    const responseBody = JSON.stringify(response);

    return this.repository.complete({ key, responseBody });
  }
}
