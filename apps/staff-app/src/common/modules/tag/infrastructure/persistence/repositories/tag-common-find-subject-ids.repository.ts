import { Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';

import {
  ITagCommonFindSubjectIdsQuery,
  ITagCommonFindSubjectIdsRecord,
  ITagCommonFindSubjectIdsRepositoryPort,
} from '../../../outbound';
import { TagCommonPersistenceHost } from '../host/tag-common-persistence.host';

@Injectable()
export class TagCommonFindSubjectIdsRepository
  extends TagCommonPersistenceHost
  implements ITagCommonFindSubjectIdsRepositoryPort
{
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async list(
    query: ITagCommonFindSubjectIdsQuery,
  ): Promise<ITagCommonFindSubjectIdsRecord[]> {
    return await this.createSubjectTagBuilder().forList(query).getMany();
  }
}
