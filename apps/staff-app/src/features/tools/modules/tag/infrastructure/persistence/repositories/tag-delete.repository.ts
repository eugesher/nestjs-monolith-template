import { Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';

import { ITagDeleteRepositoryPort } from '../../../outbound';
import { TagPersistenceHost } from '../host/tag-persistence.host';

@Injectable()
export class TagDeleteRepository extends TagPersistenceHost implements ITagDeleteRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async delete(tagId: string): Promise<void> {
    await this.tagRepository.delete({ id: tagId });
  }
}
