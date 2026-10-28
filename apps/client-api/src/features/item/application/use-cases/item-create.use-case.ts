import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { type ITransactionPort, TRANSACTION_PORT } from '@acme-libs/contracts/database';
import { ItemDomainException, ItemErrorCodeEnum, ItemModel } from '../../domain';
import {
  type IItemCreateRepositoryPort,
  type IItemEventsPort,
  type IItemIdempotencyPort,
  ITEM_CREATE_REPOSITORY_PORT,
  ITEM_EVENTS_PORT,
  ITEM_IDEMPOTENCY_PORT,
} from '../../outbound';
import { IItemCreateCommand, IItemView } from '../interfaces';
import { ItemViewMapper } from '../mappers/item-view.mapper';

@Injectable()
export class ItemCreateUseCase {
  constructor(
    @Inject(ITEM_CREATE_REPOSITORY_PORT)
    private readonly repository: IItemCreateRepositoryPort,
    @Inject(ITEM_IDEMPOTENCY_PORT)
    private readonly idempotency: IItemIdempotencyPort,
    @Inject(ITEM_EVENTS_PORT)
    private readonly events: IItemEventsPort,
    @Inject(TRANSACTION_PORT)
    private readonly transaction: ITransactionPort,
    @InjectPinoLogger(ItemCreateUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IItemCreateCommand): Promise<IItemView> {
    const { sku, name, ownerId, idempotencyKey } = command;
    const claim = await this.idempotency.claim<IItemView>({
      key: idempotencyKey,
      body: { sku, name, ownerId },
    });

    if (claim.outcome === 'replay') {
      this.logger.info({ idempotencyKey }, 'Item creation replayed from the idempotency store');

      return claim.storedResponse;
    }

    if (claim.outcome === 'in-flight') {
      throw new ItemDomainException(
        ItemErrorCodeEnum.ITEM_IDEMPOTENT_REQUEST_IN_FLIGHT,
        `Idempotency-Key ${idempotencyKey} is still being processed, retry shortly`,
      );
    }

    if (claim.outcome === 'mismatch') {
      throw new ItemDomainException(
        ItemErrorCodeEnum.ITEM_IDEMPOTENCY_KEY_REUSED,
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

  private async create(command: IItemCreateCommand): Promise<IItemView> {
    const { sku, name, ownerId, idempotencyKey } = command;
    const taken = await this.repository.existsBySku(sku);

    if (taken) {
      throw new ItemDomainException(
        ItemErrorCodeEnum.ITEM_SKU_TAKEN,
        `Item sku ${sku} is already registered`,
      );
    }

    const draft = ItemModel.create({ sku, name, ownerId });
    const view = await this.transaction.run(() => this.persist(draft, idempotencyKey));
    const events = draft.pullDomainEvents();

    await this.events.publish({ itemId: view.id, events });

    this.logger.info({ itemId: view.id, sku: view.sku }, 'Item created');

    return view;
  }

  private async persist(draft: ItemModel, idempotencyKey: string): Promise<IItemView> {
    const created = await this.repository.insert(draft);
    const view = ItemViewMapper.toView(created);

    await this.idempotency.complete({ key: idempotencyKey, response: view });

    return view;
  }
}
