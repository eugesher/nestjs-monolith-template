import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

import { type INoteResolveRepositoryPort } from '../../../outbound';
import { NoteUpdateBaseRepository } from './base/note-update-base.repository';

@Injectable()
export class NoteResolveRepository
  extends NoteUpdateBaseRepository
  implements INoteResolveRepositoryPort
{
  constructor(txHost: TransactionHost<TransactionalAdapterTypeOrm>) {
    super(txHost);
  }
}
