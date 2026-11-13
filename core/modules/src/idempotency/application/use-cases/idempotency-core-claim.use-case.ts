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
    const keyDraft = IdempotencyCoreKeyModel.createDraft({ scope, key, requestFingerprint });
    const insertOutcome = await this.insert(keyDraft);

    if (insertOutcome) {
      return { outcome: IdempotencyCoreClaimOutcomeEnum.CLAIMED, storedResponse: undefined };
    }

    const keyRecord = await this.repository.findByKey({ scope, key });

    if (!keyRecord) {
      return this.inFlight(scope, key);
    }

    const existingKey = IdempotencyCoreKeyModel.reconstitute(keyRecord);

    if (!existingKey.matches(requestFingerprint)) {
      this.logger.info(
        { scope, key },
        'Idempotency key reused with another body, the request is refused',
      );

      return { outcome: IdempotencyCoreClaimOutcomeEnum.MISMATCH, storedResponse: undefined };
    }

    if (existingKey.isCompleted()) {
      const storedResponse: unknown = JSON.parse(existingKey.responseBody);

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

    const insertOutcome = await this.repository.insert({
      scope,
      idempotencyKey: key,
      requestFingerprint,
      status,
      responseBody,
    });

    return insertOutcome === IdempotencyCoreClaimInsertOutcomeEnum.INSERTED;
  }
}
