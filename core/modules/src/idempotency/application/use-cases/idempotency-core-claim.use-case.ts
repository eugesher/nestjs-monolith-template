import { Inject, Injectable } from '@nestjs/common';

import {
  IdempotencyCoreClaimOutcomeEnum,
  IIdempotencyCoreClaimCommand,
  IIdempotencyCoreClaimView,
} from '@acme-core/contracts/idempotency';
import { BodyFingerprintHelper } from '@acme-libs/toolkit';
import { IdempotencyCoreKeyModel } from '../../domain';
import {
  IDEMPOTENCY_CORE_CLAIM_REPOSITORY_PORT,
  type IIdempotencyCoreClaimRepositoryPort,
} from '../../outbound';

@Injectable()
export class IdempotencyCoreClaimUseCase {
  constructor(
    @Inject(IDEMPOTENCY_CORE_CLAIM_REPOSITORY_PORT)
    private readonly repository: IIdempotencyCoreClaimRepositoryPort,
  ) {}

  public async execute(command: IIdempotencyCoreClaimCommand): Promise<IIdempotencyCoreClaimView> {
    const { key, body } = command;
    const requestFingerprint = BodyFingerprintHelper.compute(body);
    const draft = IdempotencyCoreKeyModel.claim({ key, requestFingerprint });
    const inserted = await this.repository.insert(draft);

    if (inserted) {
      return { outcome: IdempotencyCoreClaimOutcomeEnum.CLAIMED, storedResponse: undefined };
    }

    const existing = await this.repository.findByKey(key);

    if (existing === undefined) {
      return { outcome: IdempotencyCoreClaimOutcomeEnum.IN_FLIGHT, storedResponse: undefined };
    }

    if (!existing.matches(requestFingerprint)) {
      return { outcome: IdempotencyCoreClaimOutcomeEnum.MISMATCH, storedResponse: undefined };
    }

    if (existing.isCompleted()) {
      const storedResponse: unknown = JSON.parse(existing.responseBody);

      return { outcome: IdempotencyCoreClaimOutcomeEnum.REPLAY, storedResponse };
    }

    return { outcome: IdempotencyCoreClaimOutcomeEnum.IN_FLIGHT, storedResponse: undefined };
  }
}
