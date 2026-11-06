import { Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { Nullable } from '@acme-libs/toolkit';

import { ITagAccessRecord, ITagAccessRepositoryPort } from '../../../outbound';
import { TagPersistenceHost } from '../host/tag-persistence.host';

@Injectable()
export class TagAccessRepository extends TagPersistenceHost implements ITagAccessRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async findById(tagId: string): Promise<Nullable<ITagAccessRecord>> {
    return await this.createTagBuilder().forById(tagId).getOne();
  }
}
