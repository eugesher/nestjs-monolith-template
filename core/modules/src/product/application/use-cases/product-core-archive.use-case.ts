import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { TRANSACTION_PORT, type ITransactionPort } from '@acme-libs/contracts/database';
import {
  IProductCoreArchiveCommand,
  IProductCoreArchiveView,
  ProductCoreArchiveOutcomeEnum,
} from '@acme-core/contracts/product';

import { ProductCoreModel } from '../../domain';
import {
  PRODUCT_CORE_ARCHIVE_REPOSITORY_PORT,
  PRODUCT_CORE_CATALOG_CACHE_PORT,
  type IProductCoreArchiveRepositoryPort,
  type IProductCoreCatalogCachePort,
} from '../../outbound';
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
    const record = await this.repository.lockById(productId);

    if (!record) {
      return { outcome: ProductCoreArchiveOutcomeEnum.NOT_FOUND, currentVersion: undefined };
    }

    const product = ProductCoreModel.reconstitute(record);

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

    await this.repository.update({
      id: product.id,
      versionAsRead,
      status: product.status,
      version: product.version,
    });

    const { id, sku, version } = product;
    const archived = { productId: id, sku, version, previousStatus };

    this.transaction.afterCommit(() => this.catalogCache.invalidate());
    this.transaction.afterCommit(() => this.ledgerService.recordArchived(archived));

    return { outcome: ProductCoreArchiveOutcomeEnum.ARCHIVED, currentVersion: version };
  }
}
