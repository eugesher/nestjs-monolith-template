import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { Note } from '@acme-core/entities';
import { Nullable } from '@acme-libs/toolkit';
import { NoteModel } from '../../../domain';
import { INoteAccessFindOwnedQuery, type INoteAccessRepositoryPort } from '../../../outbound';
import { NoteMapper } from '../mappers/note.mapper';

@Injectable()
export class NoteAccessRepository implements INoteAccessRepositoryPort {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get notes(): Repository<Note> {
    return this.txHost.tx.getRepository(Note);
  }

  public async findOwned(query: INoteAccessFindOwnedQuery): Promise<Nullable<NoteModel>> {
    const { noteId, authorId } = query;
    const note = await this.notes.findOne({ where: { id: noteId, authorId } });

    return note === null ? null : NoteMapper.toModel(note);
  }
}
