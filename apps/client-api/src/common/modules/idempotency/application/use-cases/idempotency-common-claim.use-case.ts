import { Inject, Injectable } from '@nestjs/common';

import {
  IdempotencyCommonClaimOutcomeEnum,
  IIdempotencyCommonClaimCommand,
  IIdempotencyCommonClaimView,
} from '@acme-client-contracts/idempotency';
import { BodyFingerprintHelper } from '@acme-libs/toolkit';
import { IdempotencyCommonKeyModel } from '../../domain';
import {
  IDEMPOTENCY_COMMON_CLAIM_REPOSITORY_PORT,
  type IIdempotencyCommonClaimRepositoryPort,
} from '../../outbound';

@Injectable()
export class IdempotencyCommonClaimUseCase {
  constructor(
    @Inject(IDEMPOTENCY_COMMON_CLAIM_REPOSITORY_PORT)
    private readonly repository: IIdempotencyCommonClaimRepositoryPort,
  ) {}

  public async execute(
    command: IIdempotencyCommonClaimCommand,
  ): Promise<IIdempotencyCommonClaimView> {
    const { key, body } = command;
    const requestFingerprint = BodyFingerprintHelper.compute(body);
    const draft = IdempotencyCommonKeyModel.claim({ key, requestFingerprint });
    const inserted = await this.repository.insert(draft);

    if (inserted) {
      return { outcome: IdempotencyCommonClaimOutcomeEnum.CLAIMED, storedResponse: undefined };
    }

    const existing = await this.repository.findByKey(key);

    if (existing === undefined) {
      return { outcome: IdempotencyCommonClaimOutcomeEnum.IN_FLIGHT, storedResponse: undefined };
    }

    if (!existing.matches(requestFingerprint)) {
      return { outcome: IdempotencyCommonClaimOutcomeEnum.MISMATCH, storedResponse: undefined };
    }

    if (existing.isCompleted()) {
      const storedResponse: unknown = JSON.parse(existing.responseBody);

      return { outcome: IdempotencyCommonClaimOutcomeEnum.REPLAY, storedResponse };
    }

    return { outcome: IdempotencyCommonClaimOutcomeEnum.IN_FLIGHT, storedResponse: undefined };
  }
}
