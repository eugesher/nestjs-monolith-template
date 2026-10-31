import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

import { type IReminderAccessRepositoryPort } from '../../../outbound';
import { ReminderFindByIdBaseRepository } from './base/reminder-find-by-id-base.repository';

@Injectable()
export class ReminderAccessRepository
  extends ReminderFindByIdBaseRepository
  implements IReminderAccessRepositoryPort
{
  constructor(txHost: TransactionHost<TransactionalAdapterTypeOrm>) {
    super(txHost);
  }
}
