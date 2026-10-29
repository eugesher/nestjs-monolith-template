import { Injectable } from '@nestjs/common';

import { ILedgerCatalogEventsRecordProductArchivedCommand } from '../interfaces';
import { LedgerCatalogEventsRecordService } from '../services/ledger-catalog-events-record.service';

@Injectable()
export class LedgerCatalogEventsRecordProductArchivedUseCase {
  constructor(private readonly recordService: LedgerCatalogEventsRecordService) {}

  public execute(command: ILedgerCatalogEventsRecordProductArchivedCommand): Promise<void> {
    const { productId, sku, previousStatus, occurredAt } = command;

    return this.recordService.record({
      operationKey: `product-archived:${productId}`,
      subjectType: 'product',
      subjectId: productId,
      action: 'ProductArchived',
      payload: { sku, previousStatus },
      occurredAt,
    });
  }
}
