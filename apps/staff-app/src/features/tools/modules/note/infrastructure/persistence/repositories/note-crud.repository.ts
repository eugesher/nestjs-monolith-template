import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { Note } from '@acme-core/entities';
import { IPage } from '@acme-libs/toolkit';
import { NoteModel } from '../../../domain';
import { type INoteCrudRepositoryPort, INotePageQuery } from '../../../outbound';
import { NoteMapper } from '../mappers/note.mapper';

@Injectable()
export class NoteCrudRepository implements INoteCrudRepositoryPort {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get notes(): Repository<Note> {
    return this.txHost.tx.getRepository(Note);
  }

  public async list(query: INotePageQuery): Promise<IPage<NoteModel>> {
    const { page, size, subjectType, subjectId, resolved, authorId } = query;
    const bySubject = subjectType === undefined ? {} : { subjectType, subjectId };
    const byResolved = resolved === undefined ? {} : { resolved };
    const [notes, total] = await this.notes.findAndCount({
      where: { authorId, ...bySubject, ...byResolved },
      order: { id: 'DESC' },
      skip: (page - 1) * size,
      take: size,
    });

    return {
      items: notes.map((note) => NoteMapper.toModel(note)),
      total,
      page,
      size,
    };
  }
}
