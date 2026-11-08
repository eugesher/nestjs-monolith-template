import { IHostedRepository, IOrmPort } from '@acme-libs/contracts/database';
import { Tag } from '@acme-staff/common/entities';

import { TagPersistenceBuilder } from '../builders/tag-persistence.builder';

export abstract class TagPersistenceHost {
  protected abstract readonly orm: IOrmPort;

  protected get tagRepository(): IHostedRepository<Tag> {
    return this.orm.getRepository(Tag);
  }

  protected createTagBuilder(): TagPersistenceBuilder {
    return new TagPersistenceBuilder(this.tagRepository.createQueryBuilder(Tag.name));
  }
}
