import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';

import { ITagDeleteRepositoryPort, TAG_DELETE_REPOSITORY_PORT } from '../../../outbound';
import { TagPersistenceHost } from '../host/tag-persistence.host';

@Injectable()
export class TagDeleteRepository extends TagPersistenceHost implements ITagDeleteRepositoryPort {
  public static readonly provider: ClassProvider<ITagDeleteRepositoryPort> = {
    provide: TAG_DELETE_REPOSITORY_PORT,
    useClass: TagDeleteRepository,
  };

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
