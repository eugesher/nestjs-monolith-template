import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { OccRetryHelper } from '@acme-libs/toolkit';

import {
  ProductHelper,
  ProductModel,
  ProductNotFoundException,
  ProductVersionMismatchException,
} from '../../domain';
import {
  PRODUCT_OCC_RETRY_ATTEMPTS_TOKEN,
  PRODUCT_WRITE_REPOSITORY_PORT,
  type IProductWriteRepositoryPort,
} from '../../outbound';
import { ProductWriteConflictError } from '../errors/product-write-conflict.error';
import { IProductWriteCommand, IProductWriteView } from '../interfaces';
import { ProductAccessService } from './product-access.service';

@Injectable()
export class ProductWriteService {
  constructor(
    private readonly accessService: ProductAccessService,
    @Inject(PRODUCT_WRITE_REPOSITORY_PORT)
    private readonly repository: IProductWriteRepositoryPort,
    @Inject(PRODUCT_OCC_RETRY_ATTEMPTS_TOKEN)
    private readonly occRetryAttempts: number,
    @InjectPinoLogger(ProductWriteService.name)
    private readonly logger: PinoLogger,
  ) {}

  public async write(
    command: IProductWriteCommand,
    mutate: (product: ProductModel) => void,
  ): Promise<IProductWriteView> {
    const { productId, expectedVersion } = command;
    const maxAttempts = expectedVersion === undefined ? this.occRetryAttempts : 1;

    return await OccRetryHelper.run(() => this.attempt(command, mutate), {
      subject: 'Product',
      logger: this.logger,
      maxAttempts,
      isConflict: (error): error is ProductWriteConflictError =>
        error instanceof ProductWriteConflictError,
      retryContext: (conflict) => ({ productId, currentVersion: conflict.currentVersion }),
      exhaustedContext: () => ({ productId }),
      onExhausted: (conflict, attempts) => {
        throw new ProductVersionMismatchException(
          productId,
          conflict.currentVersion,
          `Product ${productId} write lost the optimistic race after ${attempts} attempts`,
        );
      },
    });
  }

  private async attempt(
    command: IProductWriteCommand,
    mutate: (product: ProductModel) => void,
  ): Promise<IProductWriteView> {
    const { productId, expectedVersion } = command;
    const product = await this.accessService.load({ productId });

    ProductHelper.assertExpectedVersion(product, expectedVersion);

    const versionAsRead = product.version;

    mutate(product);

    const events = product.pullDomainEvents();

    if (product.version === versionAsRead) {
      return { product, events };
    }

    const updated = await this.repository.update({
      id: product.id,
      versionAsRead,
      name: product.name,
      status: product.status,
      version: product.version,
    });

    if (!updated) {
      const current = await this.load(productId);

      throw new ProductWriteConflictError(productId, current.version);
    }

    const saved = await this.load(productId);

    return { product: saved, events };
  }

  private async load(productId: string): Promise<ProductModel> {
    const record = await this.repository.findById(productId);

    if (!record) {
      throw new ProductNotFoundException(productId);
    }

    return ProductModel.reconstitute(record);
  }
}
