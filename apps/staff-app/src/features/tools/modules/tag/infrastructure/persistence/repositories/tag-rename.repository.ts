import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { Tag } from '@acme-staff/common/entities';

import { ITagRenameQuery, ITagRenameRepositoryPort } from '../../../outbound';

@Injectable()
export class TagRenameRepository implements ITagRenameRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get tagRepository(): IHostedRepository<Tag> {
    return this.repositoryHost.getRepository(Tag);
  }

  public async update(query: ITagRenameQuery): Promise<void> {
    const { id, name } = query;

    await this.tagRepository.update({ id }, { name });
  }
}
