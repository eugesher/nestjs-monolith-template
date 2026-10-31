import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import {
  IProductCoreArchiveCommand,
  IProductCoreArchiveView,
  ProductCoreArchiveOutcomeEnum,
} from '@acme-core/contracts/product';
import { type ITransactionPort, TRANSACTION_PORT } from '@acme-libs/contracts/database';
import { ProductStatusEnum } from '@acme-libs/kernel';
import { CorrelationContextHelper } from '@acme-libs/observability';
import { ReplayRetryHelper } from '@acme-libs/toolkit';
import { ProductCoreModel } from '../../domain';
import {
  type IProductCoreArchiveRepositoryPort,
  type IProductCoreCatalogCachePort,
  IProductCoreLedgerRecordEnqueueCommand,
  type IProductCoreLedgerRecordPort,
  PRODUCT_CORE_ARCHIVE_REPOSITORY_PORT,
  PRODUCT_CORE_CATALOG_CACHE_PORT,
  PRODUCT_CORE_LEDGER_RECORD_PORT,
  PRODUCT_CORE_LEDGER_RETRY_ATTEMPTS,
} from '../../outbound';

@Injectable()
export class ProductCoreArchiveUseCase {
  constructor(
    @Inject(PRODUCT_CORE_ARCHIVE_REPOSITORY_PORT)
    private readonly repository: IProductCoreArchiveRepositoryPort,
    @Inject(PRODUCT_CORE_LEDGER_RECORD_PORT)
    private readonly ledgerRecord: IProductCoreLedgerRecordPort,
    @Inject(PRODUCT_CORE_CATALOG_CACHE_PORT)
    private readonly catalogCache: IProductCoreCatalogCachePort,
    @Inject(TRANSACTION_PORT)
    private readonly transaction: ITransactionPort,
    @Inject(PRODUCT_CORE_LEDGER_RETRY_ATTEMPTS)
    private readonly ledgerRetryAttempts: number,
    @InjectPinoLogger(ProductCoreArchiveUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IProductCoreArchiveCommand): Promise<IProductCoreArchiveView> {
    const { productId } = command;
    const view = await this.transaction.run(() => this.archive(command));
    const { outcome, currentVersion } = view;

    if (outcome === ProductCoreArchiveOutcomeEnum.ARCHIVED) {
      this.logger.info({ productId, version: currentVersion }, 'Product archived');
    }

    return view;
  }

  private async archive(command: IProductCoreArchiveCommand): Promise<IProductCoreArchiveView> {
    const { productId, expectedVersion } = command;
    const product = await this.repository.lockById(productId);

    if (product === null) {
      return { outcome: ProductCoreArchiveOutcomeEnum.NOT_FOUND, currentVersion: undefined };
    }

    if (expectedVersion !== undefined && expectedVersion !== product.version) {
      return {
        outcome: ProductCoreArchiveOutcomeEnum.VERSION_MISMATCH,
        currentVersion: product.version,
      };
    }

    if (product.isArchived) {
      return {
        outcome: ProductCoreArchiveOutcomeEnum.ALREADY_ARCHIVED,
        currentVersion: product.version,
      };
    }

    const versionAsRead = product.version;
    const previousStatus = product.status;

    product.archive();

    await this.repository.update({ product, versionAsRead });

    const record = this.toRecord(product, previousStatus);

    this.transaction.afterCommit(() => this.announce(record));

    return { outcome: ProductCoreArchiveOutcomeEnum.ARCHIVED, currentVersion: product.version };
  }

  private toRecord(
    product: ProductCoreModel,
    previousStatus: ProductStatusEnum,
  ): IProductCoreLedgerRecordEnqueueCommand {
    const { id, sku, version } = product;
    const correlationId = CorrelationContextHelper.current(ProductCoreArchiveUseCase.name);
    const occurredAt = new Date().toISOString();

    return {
      operationKey: `product-archived:${id}:${version}`,
      subjectType: 'product',
      subjectId: id,
      action: 'ProductArchived',
      payload: { sku, previousStatus },
      occurredAt,
      correlationId,
    };
  }

  private async announce(record: IProductCoreLedgerRecordEnqueueCommand): Promise<void> {
    const { operationKey, subjectId, correlationId } = record;

    await this.catalogCache.invalidate();
    await ReplayRetryHelper.retryThenLogForReplay(() => this.ledgerRecord.enqueue(record), {
      maxAttempts: this.ledgerRetryAttempts,
      logger: this.logger,
      correlationId,
      label: 'Ledger enqueue (product archived)',
      context: { productId: subjectId, operationKey },
      replayMessage:
        'Ledger enqueue failed permanently: the product is archived but absent from the ledger, replay this record',
    });
  }
}
