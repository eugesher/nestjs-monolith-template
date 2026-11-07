import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { MysqlErrorHelper } from '@acme-libs/toolkit';
import {
  LOCAL_STORAGE_TRANSACTION,
  type ILocalStorageTransaction,
} from '@acme-libs/contracts/local-storage';

import {
  IProductDraft,
  ProductIdempotencyKeyReusedException,
  ProductIdempotentRequestInFlightException,
  ProductModel,
  ProductSkuTakenException,
} from '../../domain';
import {
  PRODUCT_CREATE_REPOSITORY_PORT,
  PRODUCT_IDEMPOTENCY_PORT,
  ProductIdempotencyOutcomeEnum,
  type IProductCreateRepositoryPort,
  type IProductIdempotencyPort,
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
    @Inject(LOCAL_STORAGE_TRANSACTION)
    private readonly transaction: ILocalStorageTransaction,
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

  private async persist(draft: IProductDraft, idempotencyKey: string): Promise<IProductView> {
    try {
      const productId = await this.repository.insert(draft);
      const record = await this.repository.findInserted(productId);
      const created = ProductModel.reconstitute(record);
      const view = created.toView();

      await this.idempotency.complete({ key: idempotencyKey, response: view });

      return view;
    } catch (error) {
      if (MysqlErrorHelper.isDuplicateKey(error)) {
        throw new ProductSkuTakenException(draft.sku);
      }

      throw error;
    }
  }
}
