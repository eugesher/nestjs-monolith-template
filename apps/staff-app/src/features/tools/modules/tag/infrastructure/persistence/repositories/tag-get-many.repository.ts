import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { REPOSITORY_HOST_PORT, type IRepositoryHostPort } from '@acme-libs/contracts/database';

import {
  ITagGetManyQuery,
  ITagGetManyRecord,
  ITagGetManyRepositoryPort,
  TAG_GET_MANY_REPOSITORY_PORT,
} from '../../../outbound';
import { TagPersistenceHost } from '../host/tag-persistence.host';

@Injectable()
export class TagGetManyRepository extends TagPersistenceHost implements ITagGetManyRepositoryPort {
  public static readonly provider: ClassProvider<ITagGetManyRepositoryPort> = {
    provide: TAG_GET_MANY_REPOSITORY_PORT,
    useClass: TagGetManyRepository,
  };

  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async list(query: ITagGetManyQuery): Promise<ITagGetManyRecord> {
    return await this.createTagBuilder().forList(query).getManyAndCount();
  }
}
