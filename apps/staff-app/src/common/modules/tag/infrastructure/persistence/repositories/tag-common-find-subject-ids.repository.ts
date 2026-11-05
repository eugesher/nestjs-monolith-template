import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { SubjectTag } from '@acme-staff/common/entities';

import {
  ITagCommonFindSubjectIdsQuery,
  ITagCommonFindSubjectIdsRecord,
  ITagCommonFindSubjectIdsRepositoryPort,
} from '../../../outbound';

@Injectable()
export class TagCommonFindSubjectIdsRepository implements ITagCommonFindSubjectIdsRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get subjectTagRepository(): IHostedRepository<SubjectTag> {
    return this.repositoryHost.getRepository(SubjectTag);
  }

  public async list(
    query: ITagCommonFindSubjectIdsQuery,
  ): Promise<ITagCommonFindSubjectIdsRecord[]> {
    const { subjectType, tagId } = query;

    return await this.subjectTagRepository
      .createQueryBuilder('SubjectTag')
      .select(['SubjectTag.id', 'SubjectTag.subjectId'])
      .where('SubjectTag.tagId = :tagId', { tagId })
      .andWhere('SubjectTag.subjectType = :subjectType', { subjectType })
      .getMany();
  }
}
