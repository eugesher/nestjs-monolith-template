import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import {
  IProductDraftOutput,
  ProductIdempotencyKeyReusedException,
  ProductIdempotentRequestInFlightException,
  ProductModel,
  ProductSkuTakenException,
} from '../../domain';
import {
  PRODUCT_CREATE_REPOSITORY_PORT,
  PRODUCT_IDEMPOTENCY_PORT,
  PRODUCT_TRANSACTION_PORT,
  ProductCreateInsertOutcomeEnum,
  ProductIdempotencyOutcomeEnum,
  type IProductCreateRepositoryPort,
  type IProductIdempotencyPort,
  type IProductTransactionPort,
} from '../../outbound';
import { IProductCreateCommand, IProductView } from '../interfaces';
import { ProductLedgerService } from '../services/product-ledger.service';

@Injectable()
export class ProductCreateUseCase {
  constructor(
    private readonly ledgerService: ProductLedgerService,
    @Inject(PRODUCT_CREATE_REPOSITORY_PORT)
    private readonly repository: IProductCreateRepositoryPort,
    @Inject(PRODUCT_IDEMPOTENCY_PORT)
    private readonly idempotency: IProductIdempotencyPort,
    @Inject(PRODUCT_TRANSACTION_PORT)
    private readonly transaction: IProductTransactionPort,
    @InjectPinoLogger(ProductCreateUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IProductCreateCommand): Promise<IProductView> {
    const { sku, name, idempotencyKey } = command;
    const claim = await this.idempotency.claim<IProductView>({
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

    try {
      const taken = await this.repository.existsBySku(sku);

      if (taken) {
        throw new ProductSkuTakenException(sku);
      }

      const draft = ProductModel.createDraft({ sku, name });
      const view = await this.transaction.run(() => this.persist(draft, idempotencyKey));

      await this.ledgerService.recordCreated({
        productId: view.id,
        sku: view.sku,
        name: view.name,
      });

      this.logger.info({ productId: view.id, sku: view.sku }, 'Product created');

      return view;
    } catch (error) {
      await this.idempotency.release({ key: idempotencyKey });

      throw error;
    }
  }

  private async persist(draft: IProductDraftOutput, idempotencyKey: string): Promise<IProductView> {
    const inserted = await this.repository.insert(draft);

    if (inserted.outcome === ProductCreateInsertOutcomeEnum.DUPLICATE) {
      throw new ProductSkuTakenException(draft.sku);
    }

    const record = await this.repository.findInserted(inserted.id);
    const created = ProductModel.reconstitute(record);
    const view = created.toSnapshot();

    await this.idempotency.complete({ key: idempotencyKey, response: view });

    return view;
  }
}
