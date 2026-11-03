import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { Note } from '@acme-staff/common/entities';

import { INoteCreateRepositoryPort, INoteFoundRecord, INoteInsertCommand } from '../../../outbound';

@Injectable()
export class NoteCreateRepository implements INoteCreateRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get noteRepository(): IHostedRepository<Note> {
    return this.repositoryHost.getRepository(Note);
  }

  public async insert(command: INoteInsertCommand): Promise<string> {
    return await this.noteRepository.insertOne(command);
  }

  public async findInserted(noteId: string): Promise<INoteFoundRecord> {
    return await this.noteRepository
      .createQueryBuilder('Note')
      .select([
        'Note.id',
        'Note.subjectType',
        'Note.subjectId',
        'Note.body',
        'Note.authorId',
        'Note.resolved',
        'Note.version',
        'Note.createdAt',
        'Note.updatedAt',
      ])
      .where('Note.id = :noteId', { noteId })
      .getOneOrFail();
  }
}
