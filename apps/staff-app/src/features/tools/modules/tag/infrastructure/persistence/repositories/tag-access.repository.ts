import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { Nullable } from '@acme-libs/toolkit';
import { REPOSITORY_HOST_PORT, type IRepositoryHostPort } from '@acme-libs/contracts/database';

import {
  ITagAccessRecord,
  ITagAccessRepositoryPort,
  TAG_ACCESS_REPOSITORY_PORT,
} from '../../../outbound';
import { TagPersistenceHost } from '../host/tag-persistence.host';

@Injectable()
export class TagAccessRepository extends TagPersistenceHost implements ITagAccessRepositoryPort {
  public static readonly provider: ClassProvider<ITagAccessRepositoryPort> = {
    provide: TAG_ACCESS_REPOSITORY_PORT,
    useClass: TagAccessRepository,
  };

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
