import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { type ITransactionPort, TRANSACTION_PORT } from '@acme-libs/contracts/database';

import {
  ProductIdempotencyKeyReusedException,
  ProductIdempotentRequestInFlightException,
  ProductModel,
  ProductSkuTakenException,
} from '../../domain';
import {
  type IProductCreateRepositoryPort,
  type IProductIdempotencyPort,
  PRODUCT_CREATE_REPOSITORY_PORT,
  PRODUCT_IDEMPOTENCY_PORT,
} from '../../outbound';
import { IProductCreateCommand, IProductView } from '../interfaces';
import { ProductViewMapper } from '../mappers/product-view.mapper';
import { ProductLedgerService } from '../services/product-ledger.service';

@Injectable()
export class ProductCreateUseCase {
  constructor(
    private readonly ledgerService: ProductLedgerService,
    @Inject(PRODUCT_CREATE_REPOSITORY_PORT)
    private readonly repository: IProductCreateRepositoryPort,
    @Inject(PRODUCT_IDEMPOTENCY_PORT)
    private readonly idempotency: IProductIdempotencyPort,
    @Inject(TRANSACTION_PORT)
    private readonly transaction: ITransactionPort,
    @InjectPinoLogger(ProductCreateUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IProductCreateCommand): Promise<IProductView> {
    const { sku, name, idempotencyKey } = command;
    const claim = await this.idempotency.claim<IProductView>({
      key: idempotencyKey,
      body: { sku, name },
    });

    if (claim.outcome === 'replay') {
      this.logger.info({ idempotencyKey }, 'Product creation replayed from the idempotency store');

      return claim.storedResponse;
    }

    if (claim.outcome === 'in-flight') {
      throw new ProductIdempotentRequestInFlightException(idempotencyKey);
    }

    if (claim.outcome === 'mismatch') {
      throw new ProductIdempotencyKeyReusedException(idempotencyKey);
    }

    try {
      const taken = await this.repository.existsBySku(sku);

      if (taken) {
        throw new ProductSkuTakenException(sku);
      }

      const draft = ProductModel.create({ sku, name });
      const view = await this.transaction.run(() => this.persist(draft, idempotencyKey));
      const events = draft.pullDomainEvents();

      await this.ledgerService.recordEvents({ productId: view.id, events });

      this.logger.info({ productId: view.id, sku: view.sku }, 'Product created');

      return view;
    } catch (error) {
      await this.idempotency.release({ key: idempotencyKey });

      throw error;
    }
  }

  private async persist(draft: ProductModel, idempotencyKey: string): Promise<IProductView> {
    const created = await this.repository.insert(draft);
    const view = ProductViewMapper.toView(created);

    await this.idempotency.complete({ key: idempotencyKey, response: view });

    return view;
  }
}
