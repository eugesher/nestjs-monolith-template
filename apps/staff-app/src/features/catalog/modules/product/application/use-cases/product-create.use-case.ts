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
    const idempotencyClaim = await this.idempotency.claim<IProductView>({
      staffUserId,
      key: idempotencyKey,
      body: { sku, name },
    });

    if (idempotencyClaim.outcome === ProductIdempotencyOutcomeEnum.REPLAY) {
      this.logger.info({ idempotencyKey }, 'Product creation replayed from the idempotency store');

      return idempotencyClaim.storedResponse;
    }

    if (idempotencyClaim.outcome === ProductIdempotencyOutcomeEnum.IN_FLIGHT) {
      throw new ProductIdempotentRequestInFlightException(idempotencyKey);
    }

    if (idempotencyClaim.outcome === ProductIdempotencyOutcomeEnum.MISMATCH) {
      throw new ProductIdempotencyKeyReusedException(idempotencyKey);
    }

    const productView = await this.write(command);

    await this.ledger.recordCreated({
      productId: productView.id,
      sku: productView.sku,
      name: productView.name,
    });

    this.logger.info({ productId: productView.id, sku: productView.sku }, 'Product created');

    return productView;
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
    const isSkuTaken = await this.repository.existsBySku(sku);

    if (isSkuTaken) {
      throw new ProductSkuTakenException(sku);
    }

    const productDraft = ProductModel.createDraft({ sku, name });

    return await this.transaction.run(() => this.persist(productDraft, command));
  }

  private async persist(
    draft: IProductDraftOutput,
    command: IProductCreateCommand,
  ): Promise<IProductView> {
    const { staffUserId, idempotencyKey } = command;
    const insertResult = await this.repository.insert(draft);

    if (insertResult.outcome === ProductCreateInsertOutcomeEnum.DUPLICATE) {
      throw new ProductSkuTakenException(draft.sku);
    }

    const productRecord = await this.repository.findInserted(insertResult.id);
    const createdProduct = ProductModel.reconstitute(productRecord);
    const productView = createdProduct.toSnapshot();

    await this.idempotency.complete({ staffUserId, key: idempotencyKey, response: productView });

    return productView;
  }
}
