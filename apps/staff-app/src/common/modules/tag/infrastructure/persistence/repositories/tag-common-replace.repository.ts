import { ClassProvider, Inject, Injectable } from '@nestjs/common';
import { In } from 'typeorm';

import { REPOSITORY_HOST_PORT, type IRepositoryHostPort } from '@acme-libs/contracts/database';

import {
  ITagCommonReplaceFindLinkedQuery,
  ITagCommonReplaceLinkQuery,
  ITagCommonReplaceRepositoryPort,
  ITagCommonReplaceSubjectTagRecord,
  ITagCommonReplaceTagRecord,
  ITagCommonReplaceUnlinkQuery,
  TAG_COMMON_REPLACE_REPOSITORY_PORT,
} from '../../../outbound';
import { TagCommonPersistenceHost } from '../host/tag-common-persistence.host';

@Injectable()
export class TagCommonReplaceRepository
  extends TagCommonPersistenceHost
  implements ITagCommonReplaceRepositoryPort
{
  public static readonly provider: ClassProvider<ITagCommonReplaceRepositoryPort> = {
    provide: TAG_COMMON_REPLACE_REPOSITORY_PORT,
    useClass: TagCommonReplaceRepository,
  };

  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async lockTags(tagIds: string[]): Promise<ITagCommonReplaceTagRecord[]> {
    if (tagIds.length === 0) {
      return [];
    }

    return await this.createTagBuilder().forLockTags(tagIds).getMany();
  }

  public async findLinked(
    query: ITagCommonReplaceFindLinkedQuery,
  ): Promise<ITagCommonReplaceSubjectTagRecord[]> {
    return await this.createSubjectTagBuilder().forLinked(query).getMany();
  }

  public async link(query: ITagCommonReplaceLinkQuery): Promise<void> {
    const { subjectType, subjectId, tagIds } = query;

    if (tagIds.length === 0) {
      return;
    }

    const rows = tagIds.map((tagId) => ({ subjectType, subjectId, tagId }));

    await this.subjectTagRepository.insert(rows);
  }

  public async unlink(query: ITagCommonReplaceUnlinkQuery): Promise<void> {
    const { subjectType, subjectId, tagIds } = query;

    if (tagIds.length === 0) {
      return;
    }

    await this.subjectTagRepository.delete({ subjectType, subjectId, tagId: In(tagIds) });
  }
}
