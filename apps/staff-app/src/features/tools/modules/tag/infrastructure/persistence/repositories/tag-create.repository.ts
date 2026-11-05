import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { Tag } from '@acme-staff/common/entities';

import { ITagCreateQuery, ITagCreateRecord, ITagCreateRepositoryPort } from '../../../outbound';

@Injectable()
export class TagCreateRepository implements ITagCreateRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get tagRepository(): IHostedRepository<Tag> {
    return this.repositoryHost.getRepository(Tag);
  }

  public async insert(query: ITagCreateQuery): Promise<string> {
    return await this.tagRepository.insertOne(query);
  }

  public async findInserted(tagId: string): Promise<ITagCreateRecord> {
    return await this.tagRepository
      .createQueryBuilder('Tag')
      .select(['Tag.id', 'Tag.name', 'Tag.createdAt', 'Tag.updatedAt'])
      .where('Tag.id = :tagId', { tagId })
      .getOneOrFail();
  }
}
