import { Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';

import { ITagGetManyQuery, ITagGetManyRecord, ITagGetManyRepositoryPort } from '../../../outbound';
import { TagPersistenceHost } from '../host/tag-persistence.host';

@Injectable()
export class TagGetManyRepository extends TagPersistenceHost implements ITagGetManyRepositoryPort {
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
