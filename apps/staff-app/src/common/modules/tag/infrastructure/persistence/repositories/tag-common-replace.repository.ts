import { Inject, Injectable } from '@nestjs/common';
import { In } from 'typeorm';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { SubjectTag, Tag } from '@acme-staff/common/entities';

import {
  ITagCommonReplaceFindLinkedQuery,
  ITagCommonReplaceLinkQuery,
  ITagCommonReplaceRepositoryPort,
  ITagCommonReplaceSubjectTagRecord,
  ITagCommonReplaceTagRecord,
  ITagCommonReplaceUnlinkQuery,
} from '../../../outbound';

@Injectable()
export class TagCommonReplaceRepository implements ITagCommonReplaceRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get tagRepository(): IHostedRepository<Tag> {
    return this.repositoryHost.getRepository(Tag);
  }

  private get subjectTagRepository(): IHostedRepository<SubjectTag> {
    return this.repositoryHost.getRepository(SubjectTag);
  }

  public async lockTags(tagIds: string[]): Promise<ITagCommonReplaceTagRecord[]> {
    if (tagIds.length === 0) {
      return [];
    }

    return await this.tagRepository
      .createQueryBuilder('Tag')
      .select(['Tag.id', 'Tag.name'])
      .where('Tag.id IN (:...tagIds)', { tagIds })
      .orderBy('Tag.name', 'ASC')
      .setLock('pessimistic_read')
      .getMany();
  }

  public async findLinked(
    query: ITagCommonReplaceFindLinkedQuery,
  ): Promise<ITagCommonReplaceSubjectTagRecord[]> {
    const { subjectType, subjectId } = query;

    return await this.subjectTagRepository
      .createQueryBuilder('SubjectTag')
      .select(['SubjectTag.id', 'SubjectTag.tagId'])
      .where('SubjectTag.subjectType = :subjectType', { subjectType })
      .andWhere('SubjectTag.subjectId = :subjectId', { subjectId })
      .getMany();
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
