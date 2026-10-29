import { Injectable } from '@nestjs/common';

import { ILedgerCatalogEventsRecordProductCreatedCommand } from '../interfaces';
import { LedgerCatalogEventsRecordService } from '../services/ledger-catalog-events-record.service';

@Injectable()
export class LedgerCatalogEventsRecordProductCreatedUseCase {
  constructor(private readonly recordService: LedgerCatalogEventsRecordService) {}

  public execute(command: ILedgerCatalogEventsRecordProductCreatedCommand): Promise<void> {
    const { productId, sku, name, occurredAt } = command;

    return this.recordService.record({
      operationKey: `product-created:${productId}`,
      subjectType: 'product',
      subjectId: productId,
      action: 'ProductCreated',
      payload: { sku, name },
      occurredAt,
    });
  }
}
