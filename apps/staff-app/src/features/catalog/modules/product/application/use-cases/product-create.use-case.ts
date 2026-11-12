import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, type PinoLogger } from 'nestjs-pino';

import {
  ProductIdempotencyKeyReusedException,
  ProductIdempotentRequestInFlightException,
  ProductModel,
  ProductSkuTakenException,
  type IProductDraftOutput,
} from '../../domain';
import {
  PRODUCT_CREATE_REPOSITORY_PORT,
  PRODUCT_IDEMPOTENCY_PORT,
  PRODUCT_LEDGER_PORT,
  PRODUCT_TRANSACTION_PORT,
  ProductCreateInsertOutcomeEnum,
  ProductIdempotencyOutcomeEnum,
  type IProductCreateRepositoryPort,
  type IProductIdempotencyPort,
  type IProductLedgerPort,
  type IProductTransactionPort,
} from '../../outbound';
import type { IProductCreateCommand, IProductView } from '../interfaces';

@Injectable()
export class ProductCreateUseCase {
  constructor(
    @Inject(PRODUCT_CREATE_REPOSITORY_PORT)
    private readonly repository: IProductCreateRepositoryPort,
    @Inject(PRODUCT_IDEMPOTENCY_PORT)
    private readonly idempotency: IProductIdempotencyPort,
    @Inject(PRODUCT_LEDGER_PORT)
    private readonly ledger: IProductLedgerPort,
    @Inject(PRODUCT_TRANSACTION_PORT)
    private readonly transaction: IProductTransactionPort,
    @InjectPinoLogger(ProductCreateUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IProductCreateCommand): Promise<IProductView> {
    const { sku, name, staffUserId, idempotencyKey } = command;
    const claim = await this.idempotency.claim<IProductView>({
      staffUserId,
      key: idempotencyKey,
      body: { sku, name },
    });

    if (claim.outcome === ProductIdempotencyOutcomeEnum.REPLAY) {
      this.logger.info({ idempotencyKey }, 'Product creation replayed from the idempotency store');

      return claim.storedResponse;
    }

    if (claim.outcome === ProductIdempotencyOutcomeEnum.IN_FLIGHT) {
      throw new ProductIdempotentRequestInFlightException(idempotencyKey);
    }

    if (claim.outcome === ProductIdempotencyOutcomeEnum.MISMATCH) {
      throw new ProductIdempotencyKeyReusedException(idempotencyKey);
    }

    const view = await this.write(command);

    await this.ledger.recordCreated({
      productId: view.id,
      sku: view.sku,
      name: view.name,
    });

    this.logger.info({ productId: view.id, sku: view.sku }, 'Product created');

    return view;
  }

  private async write(command: IProductCreateCommand): Promise<IProductView> {
    const { staffUserId, idempotencyKey } = command;

    try {
      return await this.create(command);
    } catch (error) {
      await this.idempotency.release({ staffUserId, key: idempotencyKey });

      throw error;
    }
  }

  private async create(command: IProductCreateCommand): Promise<IProductView> {
    const { sku, name } = command;
    const taken = await this.repository.existsBySku(sku);

    if (taken) {
      throw new ProductSkuTakenException(sku);
    }

    const draft = ProductModel.createDraft({ sku, name });

    return await this.transaction.run(() => this.persist(draft, command));
  }

  private async persist(
    draft: IProductDraftOutput,
    command: IProductCreateCommand,
  ): Promise<IProductView> {
    const { staffUserId, idempotencyKey } = command;
    const inserted = await this.repository.insert(draft);

    if (inserted.outcome === ProductCreateInsertOutcomeEnum.DUPLICATE) {
      throw new ProductSkuTakenException(draft.sku);
    }

    const record = await this.repository.findInserted(inserted.id);
    const created = ProductModel.reconstitute(record);
    const view = created.toSnapshot();

    await this.idempotency.complete({ staffUserId, key: idempotencyKey, response: view });

    return view;
  }
}
