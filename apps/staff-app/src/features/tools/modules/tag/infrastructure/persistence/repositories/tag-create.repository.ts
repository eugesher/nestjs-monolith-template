import { Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';

import { ITagCreateQuery, ITagCreateRecord, ITagCreateRepositoryPort } from '../../../outbound';
import { TagPersistenceHost } from '../host/tag-persistence.host';

@Injectable()
export class TagCreateRepository extends TagPersistenceHost implements ITagCreateRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async insert(query: ITagCreateQuery): Promise<string> {
    return await this.tagRepository.insertOne(query);
  }

  public async findInserted(tagId: string): Promise<ITagCreateRecord> {
    return await this.createTagBuilder().forInserted(tagId).getOneOrFail();
  }
}
