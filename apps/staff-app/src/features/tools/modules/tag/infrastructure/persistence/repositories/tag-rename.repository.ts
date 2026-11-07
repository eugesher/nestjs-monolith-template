import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { REPOSITORY_HOST_PORT, type IRepositoryHostPort } from '@acme-libs/contracts/database';

import {
  ITagRenameQuery,
  ITagRenameRepositoryPort,
  TAG_RENAME_REPOSITORY_PORT,
} from '../../../outbound';
import { TagPersistenceHost } from '../host/tag-persistence.host';

@Injectable()
export class TagRenameRepository extends TagPersistenceHost implements ITagRenameRepositoryPort {
  public static readonly provider: ClassProvider<ITagRenameRepositoryPort> = {
    provide: TAG_RENAME_REPOSITORY_PORT,
    useClass: TagRenameRepository,
  };

  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async update(query: ITagRenameQuery): Promise<void> {
    const { id, name } = query;

    await this.tagRepository.update({ id }, { name });
  }
}
