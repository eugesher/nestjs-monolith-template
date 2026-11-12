import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, type PinoLogger } from 'nestjs-pino';

import { BodyFingerprintHelper } from '@acme-libs/toolkit';
import {
  IdempotencyCoreClaimOutcomeEnum,
  type IIdempotencyCoreClaimCommand,
  type IIdempotencyCoreClaimView,
} from '@acme-core/contracts/idempotency';

import { IdempotencyCoreKeyModel, type IIdempotencyCoreKeyDraftOutput } from '../../domain';
import {
  IDEMPOTENCY_CORE_CLAIM_REPOSITORY_PORT,
  IdempotencyCoreClaimInsertOutcomeEnum,
  type IIdempotencyCoreClaimRepositoryPort,
} from '../../outbound';

@Injectable()
export class IdempotencyCoreClaimUseCase {
  constructor(
    @Inject(IDEMPOTENCY_CORE_CLAIM_REPOSITORY_PORT)
    private readonly repository: IIdempotencyCoreClaimRepositoryPort,
    @InjectPinoLogger(IdempotencyCoreClaimUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IIdempotencyCoreClaimCommand): Promise<IIdempotencyCoreClaimView> {
    const { scope, key, body } = command;
    const requestFingerprint = BodyFingerprintHelper.compute(body);
    const draft = IdempotencyCoreKeyModel.createDraft({ scope, key, requestFingerprint });
    const inserted = await this.insert(draft);

    if (inserted) {
      return { outcome: IdempotencyCoreClaimOutcomeEnum.CLAIMED, storedResponse: undefined };
    }

    const record = await this.repository.findByKey({ scope, key });

    if (!record) {
      return this.inFlight(scope, key);
    }

    const existing = IdempotencyCoreKeyModel.reconstitute(record);

    if (!existing.matches(requestFingerprint)) {
      this.logger.info(
        { scope, key },
        'Idempotency key reused with another body, the request is refused',
      );

      return { outcome: IdempotencyCoreClaimOutcomeEnum.MISMATCH, storedResponse: undefined };
    }

    if (existing.isCompleted()) {
      const storedResponse: unknown = JSON.parse(existing.responseBody);

      return { outcome: IdempotencyCoreClaimOutcomeEnum.REPLAY, storedResponse };
    }

    return this.inFlight(scope, key);
  }

  private inFlight(scope: string, key: string): IIdempotencyCoreClaimView {
    this.logger.info({ scope, key }, 'Idempotency key is in flight, the request is refused');

    return { outcome: IdempotencyCoreClaimOutcomeEnum.IN_FLIGHT, storedResponse: undefined };
  }

  private async insert(draft: IIdempotencyCoreKeyDraftOutput): Promise<boolean> {
    const { scope, key, requestFingerprint, status, responseBody } = draft;

    const outcome = await this.repository.insert({
      scope,
      idempotencyKey: key,
      requestFingerprint,
      status,
      responseBody,
    });

    return outcome === IdempotencyCoreClaimInsertOutcomeEnum.INSERTED;
  }
}
