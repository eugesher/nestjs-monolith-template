import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { REPOSITORY_HOST_PORT, type IRepositoryHostPort } from '@acme-libs/contracts/database';

import {
  ITagCreateQuery,
  ITagCreateRecord,
  ITagCreateRepositoryPort,
  TAG_CREATE_REPOSITORY_PORT,
} from '../../../outbound';
import { TagPersistenceHost } from '../host/tag-persistence.host';

@Injectable()
export class TagCreateRepository extends TagPersistenceHost implements ITagCreateRepositoryPort {
  public static readonly provider: ClassProvider<ITagCreateRepositoryPort> = {
    provide: TAG_CREATE_REPOSITORY_PORT,
    useClass: TagCreateRepository,
  };

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
