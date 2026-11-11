import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';
import type { Nullable } from '@acme-libs/toolkit';

import {
  TAG_ACCESS_REPOSITORY_PORT,
  type ITagAccessRecord,
  type ITagAccessRepositoryPort,
} from '../../../outbound';
import { TagPersistenceHost } from '../host/tag-persistence.host';

@Injectable()
export class TagAccessRepository extends TagPersistenceHost implements ITagAccessRepositoryPort {
  public static readonly provider: ClassProvider<ITagAccessRepositoryPort> = {
    provide: TAG_ACCESS_REPOSITORY_PORT,
    useClass: TagAccessRepository,
  };

  constructor(
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
  ) {
    super();
  }

  public async findById(tagId: string): Promise<Nullable<ITagAccessRecord>> {
    return await this.createTagBuilder().forById(tagId).getOne();
  }
}
