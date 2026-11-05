import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { Tag } from '@acme-staff/common/entities';

import { ITagGetManyQuery, ITagGetManyRecord, ITagGetManyRepositoryPort } from '../../../outbound';

@Injectable()
export class TagGetManyRepository implements ITagGetManyRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get tagRepository(): IHostedRepository<Tag> {
    return this.repositoryHost.getRepository(Tag);
  }

  public async list(query: ITagGetManyQuery): Promise<ITagGetManyRecord> {
    const { limit, offset } = query;

    return await this.tagRepository
      .createQueryBuilder('Tag')
      .select(['Tag.id', 'Tag.name', 'Tag.createdAt', 'Tag.updatedAt'])
      .orderBy('Tag.name', 'ASC')
      .addOrderBy('Tag.id', 'ASC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();
  }
}
