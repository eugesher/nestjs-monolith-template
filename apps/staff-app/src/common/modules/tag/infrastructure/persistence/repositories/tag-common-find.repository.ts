import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';

import {
  TAG_COMMON_FIND_REPOSITORY_PORT,
  type ITagCommonFindQuery,
  type ITagCommonFindRecord,
  type ITagCommonFindRepositoryPort,
} from '../../../outbound';
import { TagCommonPersistenceHost } from '../host/tag-common-persistence.host';

@Injectable()
export class TagCommonFindRepository
  extends TagCommonPersistenceHost
  implements ITagCommonFindRepositoryPort
{
  public static readonly provider: ClassProvider<ITagCommonFindRepositoryPort> = {
    provide: TAG_COMMON_FIND_REPOSITORY_PORT,
    useClass: TagCommonFindRepository,
  };

  constructor(
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
  ) {
    super();
  }

  public async list(query: ITagCommonFindQuery): Promise<ITagCommonFindRecord[]> {
    return await this.createTagBuilder().forList(query).getMany();
  }
}
