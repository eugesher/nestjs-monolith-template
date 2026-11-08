import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';

import {
  ITagCommonFindSubjectIdsQuery,
  ITagCommonFindSubjectIdsRecord,
  ITagCommonFindSubjectIdsRepositoryPort,
  TAG_COMMON_FIND_SUBJECT_IDS_REPOSITORY_PORT,
} from '../../../outbound';
import { TagCommonPersistenceHost } from '../host/tag-common-persistence.host';

@Injectable()
export class TagCommonFindSubjectIdsRepository
  extends TagCommonPersistenceHost
  implements ITagCommonFindSubjectIdsRepositoryPort
{
  public static readonly provider: ClassProvider<ITagCommonFindSubjectIdsRepositoryPort> = {
    provide: TAG_COMMON_FIND_SUBJECT_IDS_REPOSITORY_PORT,
    useClass: TagCommonFindSubjectIdsRepository,
  };

  constructor(
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
  ) {
    super();
  }

  public async list(
    query: ITagCommonFindSubjectIdsQuery,
  ): Promise<ITagCommonFindSubjectIdsRecord[]> {
    return await this.createSubjectTagBuilder().forList(query).getMany();
  }
}
