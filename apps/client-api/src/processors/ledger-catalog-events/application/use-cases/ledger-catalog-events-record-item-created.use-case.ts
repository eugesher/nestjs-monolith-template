import { Injectable } from '@nestjs/common';

import { ILedgerCatalogEventsRecordItemCreatedCommand } from '../interfaces';
import { LedgerCatalogEventsRecordService } from '../services/ledger-catalog-events-record.service';

@Injectable()
export class LedgerCatalogEventsRecordItemCreatedUseCase {
  constructor(private readonly recordService: LedgerCatalogEventsRecordService) {}

  public execute(command: ILedgerCatalogEventsRecordItemCreatedCommand): Promise<void> {
    const { itemId, sku, name, ownerId, occurredAt } = command;

    return this.recordService.record({
      operationKey: `item-created:${itemId}`,
      subjectType: 'item',
      subjectId: itemId,
      action: 'ItemCreated',
      payload: { sku, name, ownerId },
      occurredAt,
    });
  }
}
