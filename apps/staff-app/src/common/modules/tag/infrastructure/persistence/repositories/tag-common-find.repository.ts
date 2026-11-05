import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { SubjectTag, Tag } from '@acme-staff/common/entities';

import {
  ITagCommonFindQuery,
  ITagCommonFindRecord,
  ITagCommonFindRepositoryPort,
} from '../../../outbound';

@Injectable()
export class TagCommonFindRepository implements ITagCommonFindRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get tagRepository(): IHostedRepository<Tag> {
    return this.repositoryHost.getRepository(Tag);
  }

  public async list(query: ITagCommonFindQuery): Promise<ITagCommonFindRecord[]> {
    const { subjectType, subjectId } = query;

    return await this.tagRepository
      .createQueryBuilder('Tag')
      .select(['Tag.id', 'Tag.name'])
      .innerJoin(SubjectTag, 'SubjectTag', 'SubjectTag.tagId = Tag.id')
      .where('SubjectTag.subjectType = :subjectType', { subjectType })
      .andWhere('SubjectTag.subjectId = :subjectId', { subjectId })
      .orderBy('Tag.name', 'ASC')
      .getMany();
  }
}
