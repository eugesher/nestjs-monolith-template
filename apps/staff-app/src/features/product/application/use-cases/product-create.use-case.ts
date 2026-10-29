import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { type ITransactionPort, TRANSACTION_PORT } from '@acme-libs/contracts/database';
import { ProductDomainException, ProductErrorCodeEnum, ProductModel } from '../../domain';
import {
  type IProductCreateRepositoryPort,
  type IProductEventsPort,
  type IProductIdempotencyPort,
  PRODUCT_CREATE_REPOSITORY_PORT,
  PRODUCT_EVENTS_PORT,
  PRODUCT_IDEMPOTENCY_PORT,
} from '../../outbound';
import { IProductCreateCommand, IProductView } from '../interfaces';
import { ProductViewMapper } from '../mappers/product-view.mapper';

@Injectable()
export class ProductCreateUseCase {
  constructor(
    @Inject(PRODUCT_CREATE_REPOSITORY_PORT)
    private readonly repository: IProductCreateRepositoryPort,
    @Inject(PRODUCT_IDEMPOTENCY_PORT)
    private readonly idempotency: IProductIdempotencyPort,
    @Inject(PRODUCT_EVENTS_PORT)
    private readonly events: IProductEventsPort,
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
      throw new ProductDomainException(
        ProductErrorCodeEnum.PRODUCT_IDEMPOTENT_REQUEST_IN_FLIGHT,
        `Idempotency-Key ${idempotencyKey} is still being processed, retry shortly`,
      );
    }

    if (claim.outcome === 'mismatch') {
      throw new ProductDomainException(
        ProductErrorCodeEnum.PRODUCT_IDEMPOTENCY_KEY_REUSED,
        `Idempotency-Key ${idempotencyKey} was already used with a different request body`,
      );
    }

    try {
      return await this.create(command);
    } catch (error) {
      await this.idempotency.release({ key: idempotencyKey });

      throw error;
    }
  }

  private async create(command: IProductCreateCommand): Promise<IProductView> {
    const { sku, name, idempotencyKey } = command;
    const taken = await this.repository.existsBySku(sku);

    if (taken) {
      throw new ProductDomainException(
        ProductErrorCodeEnum.PRODUCT_SKU_TAKEN,
        `Product sku ${sku} is already registered`,
      );
    }

    const draft = ProductModel.create({ sku, name });
    const view = await this.transaction.run(() => this.persist(draft, idempotencyKey));
    const events = draft.pullDomainEvents();

    await this.events.publish({ productId: view.id, events });

    this.logger.info({ productId: view.id, sku: view.sku }, 'Product created');

    return view;
  }

  private async persist(draft: ProductModel, idempotencyKey: string): Promise<IProductView> {
    const created = await this.repository.insert(draft);
    const view = ProductViewMapper.toView(created);

    await this.idempotency.complete({ key: idempotencyKey, response: view });

    return view;
  }
}
