import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { type ITransactionPort, TRANSACTION_PORT } from '@acme-libs/contracts/database';
import {
  IProductCoreArchiveCommand,
  IProductCoreArchiveView,
  ProductCoreArchiveOutcomeEnum,
} from '@acme-core/contracts/product';

import {
  type IProductCoreArchiveRepositoryPort,
  type IProductCoreCatalogCachePort,
  PRODUCT_CORE_ARCHIVE_REPOSITORY_PORT,
  PRODUCT_CORE_CATALOG_CACHE_PORT,
} from '../../outbound';
import { IProductCoreLedgerRecordArchivedCommand } from '../interfaces';
import { ProductCoreLedgerService } from '../services/product-core-ledger.service';

@Injectable()
export class ProductCoreArchiveUseCase {
  constructor(
    private readonly ledgerService: ProductCoreLedgerService,
    @Inject(PRODUCT_CORE_ARCHIVE_REPOSITORY_PORT)
    private readonly repository: IProductCoreArchiveRepositoryPort,
    @Inject(PRODUCT_CORE_CATALOG_CACHE_PORT)
    private readonly catalogCache: IProductCoreCatalogCachePort,
    @Inject(TRANSACTION_PORT)
    private readonly transaction: ITransactionPort,
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

    const { id, sku, version } = product;
    const record = { productId: id, sku, version, previousStatus };

    this.transaction.afterCommit(() => this.announce(record));

    return { outcome: ProductCoreArchiveOutcomeEnum.ARCHIVED, currentVersion: version };
  }

  private async announce(command: IProductCoreLedgerRecordArchivedCommand): Promise<void> {
    await this.catalogCache.invalidate();
    await this.ledgerService.recordArchived(command);
  }
}
