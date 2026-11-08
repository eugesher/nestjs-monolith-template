import { Inject, Injectable } from '@nestjs/common';

import { BodyFingerprintHelper, MysqlErrorHelper } from '@acme-libs/toolkit';
import {
  IdempotencyCoreClaimOutcomeEnum,
  IIdempotencyCoreClaimCommand,
  IIdempotencyCoreClaimView,
} from '@acme-core/contracts/idempotency';

import { IdempotencyCoreKeyModel, IIdempotencyCoreKeyDraftOutput } from '../../domain';
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
    const draft = IdempotencyCoreKeyModel.createDraft({ key, requestFingerprint });
    const inserted = await this.insert(draft);

    if (inserted) {
      return { outcome: IdempotencyCoreClaimOutcomeEnum.CLAIMED, storedResponse: undefined };
    }

    const record = await this.repository.findByKey(key);

    if (!record) {
      return { outcome: IdempotencyCoreClaimOutcomeEnum.IN_FLIGHT, storedResponse: undefined };
    }

    const existing = IdempotencyCoreKeyModel.reconstitute(record);

    if (!existing.matches(requestFingerprint)) {
      return { outcome: IdempotencyCoreClaimOutcomeEnum.MISMATCH, storedResponse: undefined };
    }

    if (existing.isCompleted()) {
      const storedResponse: unknown = JSON.parse(existing.responseBody);

      return { outcome: IdempotencyCoreClaimOutcomeEnum.REPLAY, storedResponse };
    }

    return { outcome: IdempotencyCoreClaimOutcomeEnum.IN_FLIGHT, storedResponse: undefined };
  }

  private async insert(draft: IIdempotencyCoreKeyDraftOutput): Promise<boolean> {
    const { key, requestFingerprint, status, responseBody } = draft;

    try {
      await this.repository.insert({
        idempotencyKey: key,
        requestFingerprint,
        status,
        responseBody,
      });

      return true;
    } catch (error) {
      if (MysqlErrorHelper.isDuplicateKey(error)) {
        return false;
      }

      throw error;
    }
  }
}
