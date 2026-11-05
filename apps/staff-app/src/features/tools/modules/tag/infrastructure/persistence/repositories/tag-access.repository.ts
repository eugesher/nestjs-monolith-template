import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { Nullable } from '@acme-libs/toolkit';
import { Tag } from '@acme-staff/common/entities';

import { ITagAccessRecord, ITagAccessRepositoryPort } from '../../../outbound';

@Injectable()
export class TagAccessRepository implements ITagAccessRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get tagRepository(): IHostedRepository<Tag> {
    return this.repositoryHost.getRepository(Tag);
  }

  public async findById(tagId: string): Promise<Nullable<ITagAccessRecord>> {
    return await this.tagRepository
      .createQueryBuilder('Tag')
      .select(['Tag.id', 'Tag.name', 'Tag.createdAt', 'Tag.updatedAt'])
      .where('Tag.id = :tagId', { tagId })
      .getOne();
  }
}
