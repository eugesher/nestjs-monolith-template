import { IHostedRepository, IRepositoryHostPort } from '@acme-libs/contracts/database';
import { Tag } from '@acme-staff/common/entities';

import { TagPersistenceBuilder } from '../builders/tag-persistence.builder';

export abstract class TagPersistenceHost {
  protected abstract readonly repositoryHost: IRepositoryHostPort;

  protected get tagRepository(): IHostedRepository<Tag> {
    return this.repositoryHost.getRepository(Tag);
  }

  protected createTagBuilder(): TagPersistenceBuilder {
    return new TagPersistenceBuilder(this.tagRepository.createQueryBuilder(Tag.name));
  }
}
