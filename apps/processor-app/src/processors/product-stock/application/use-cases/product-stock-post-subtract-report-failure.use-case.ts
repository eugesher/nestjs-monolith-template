import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, type PinoLogger } from 'nestjs-pino';

import type { IProductStockPostSubtractReportFailureCommand } from '../interfaces';

@Injectable()
export class ProductStockPostSubtractReportFailureUseCase {
  constructor(
    @InjectPinoLogger(ProductStockPostSubtractReportFailureUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public execute(command: IProductStockPostSubtractReportFailureCommand): void {
    const { productIds, attempt, attempts, error } = command;

    if (attempt < attempts) {
      this.logger.warn(
        { err: error, productIds, attempt, attempts },
        'Post-subtract check failed, Bull retries the job',
      );

      return;
    }

    this.logger.error(
      { err: error, productIds, attempt, attempts },
      'Post-subtract check failed permanently: the job stays in the failed set of the queue, replay it',
    );
  }
}
