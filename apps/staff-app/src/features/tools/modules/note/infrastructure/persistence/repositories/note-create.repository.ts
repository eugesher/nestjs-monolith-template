import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { Note } from '@acme-core/entities';
import { NoteModel } from '../../../domain';
import { type INoteCreateRepositoryPort } from '../../../outbound';
import { NoteMapper } from '../mappers/note.mapper';

@Injectable()
export class NoteCreateRepository implements INoteCreateRepositoryPort {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get notes(): Repository<Note> {
    return this.txHost.tx.getRepository(Note);
  }

  public async insert(note: NoteModel): Promise<NoteModel> {
    const { subjectType, subjectId, body, authorId, resolved, version } = note;
    const draft = this.notes.create({ subjectType, subjectId, body, authorId, resolved, version });
    const saved = await this.notes.save(draft);
    const stored = await this.notes.findOneOrFail({ where: { id: String(saved.id) } });

    return NoteMapper.toModel(stored);
  }
}
