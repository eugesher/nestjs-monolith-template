import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { OccRetryHelper } from '@acme-libs/toolkit';
import {
  ProductDomainException,
  ProductErrorCodeEnum,
  ProductHelper,
  ProductModel,
} from '../../domain';
import {
  type IProductWriteRepositoryPort,
  PRODUCT_OCC_RETRY_ATTEMPTS,
  PRODUCT_WRITE_REPOSITORY_PORT,
} from '../../outbound';
import { ProductWriteConflictError } from '../errors/product-write-conflict.error';
import { IProductWriteCommand } from '../interfaces/commands/product-write.command';
import { IProductWriteView } from '../interfaces/views/product-write.view';
import { ProductAccessService } from './product-access.service';

@Injectable()
export class ProductWriteService {
  constructor(
    private readonly accessService: ProductAccessService,
    @Inject(PRODUCT_WRITE_REPOSITORY_PORT)
    private readonly repository: IProductWriteRepositoryPort,
    @Inject(PRODUCT_OCC_RETRY_ATTEMPTS)
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
        throw new ProductDomainException(
          ProductErrorCodeEnum.PRODUCT_VERSION_MISMATCH,
          `Product ${productId} write lost the optimistic race after ${attempts} attempts`,
          { currentVersion: conflict.currentVersion },
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

    const updated = await this.repository.update({ product, versionAsRead });

    if (!updated) {
      const current = await this.load(productId);

      throw new ProductWriteConflictError(productId, current.version);
    }

    const saved = await this.load(productId);

    return { product: saved, events };
  }

  private async load(productId: string): Promise<ProductModel> {
    const product = await this.repository.findById(productId);

    if (product === null) {
      throw new ProductDomainException(
        ProductErrorCodeEnum.PRODUCT_NOT_FOUND,
        `Product ${productId} was not found`,
      );
    }

    return product;
  }
}
