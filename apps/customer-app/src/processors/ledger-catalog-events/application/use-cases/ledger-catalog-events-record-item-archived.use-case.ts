import { Injectable } from '@nestjs/common';

import { ILedgerCatalogEventsRecordItemArchivedCommand } from '../interfaces';
import { LedgerCatalogEventsRecordService } from '../services/ledger-catalog-events-record.service';

@Injectable()
export class LedgerCatalogEventsRecordItemArchivedUseCase {
  constructor(private readonly recordService: LedgerCatalogEventsRecordService) {}

  public execute(command: ILedgerCatalogEventsRecordItemArchivedCommand): Promise<void> {
    const { itemId, sku, previousStatus, occurredAt } = command;

    return this.recordService.record({
      operationKey: `item-archived:${itemId}`,
      subjectType: 'item',
      subjectId: itemId,
      action: 'ItemArchived',
      payload: { sku, previousStatus },
      occurredAt,
    });
  }
}
