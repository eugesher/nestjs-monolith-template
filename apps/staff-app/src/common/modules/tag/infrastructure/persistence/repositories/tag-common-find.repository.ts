import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';

import {
  ITagCommonFindQuery,
  ITagCommonFindRecord,
  ITagCommonFindRepositoryPort,
  TAG_COMMON_FIND_REPOSITORY_PORT,
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
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async list(query: ITagCommonFindQuery): Promise<ITagCommonFindRecord[]> {
    return await this.createTagBuilder().forList(query).getMany();
  }
}
