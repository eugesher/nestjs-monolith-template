import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { IProductRenameCommand, IProductView } from '../interfaces';
import { ProductViewMapper } from '../mappers/product-view.mapper';
import { ProductWriteService } from '../services/product-write.service';

@Injectable()
export class ProductRenameUseCase {
  constructor(
    private readonly writeService: ProductWriteService,
    @InjectPinoLogger(ProductRenameUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IProductRenameCommand): Promise<IProductView> {
    const { productId, name, expectedVersion } = command;
    const written = await this.writeService.write({ productId, expectedVersion }, (product) =>
      product.rename(name),
    );
    const { product } = written;
    const view = ProductViewMapper.toView(product);

    this.logger.info({ productId, version: view.version }, 'Product renamed');

    return view;
  }
}
