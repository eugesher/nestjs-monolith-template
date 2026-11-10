import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { MysqlErrorHelper } from '@acme-libs/toolkit';
import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';

import {
  ITagRenameQuery,
  ITagRenameRepositoryPort,
  TAG_RENAME_REPOSITORY_PORT,
  TagRenameUpdateOutcomeEnum,
} from '../../../outbound';
import { TagPersistenceHost } from '../host/tag-persistence.host';

@Injectable()
export class TagRenameRepository extends TagPersistenceHost implements ITagRenameRepositoryPort {
  public static readonly provider: ClassProvider<ITagRenameRepositoryPort> = {
    provide: TAG_RENAME_REPOSITORY_PORT,
    useClass: TagRenameRepository,
  };

  constructor(
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
  ) {
    super();
  }

  public async update(query: ITagRenameQuery): Promise<TagRenameUpdateOutcomeEnum> {
    const { id, name } = query;

    try {
      await this.tagRepository.update({ id }, { name });

      return TagRenameUpdateOutcomeEnum.UPDATED;
    } catch (error) {
      if (MysqlErrorHelper.isDuplicateKey(error)) {
        return TagRenameUpdateOutcomeEnum.DUPLICATE;
      }

      throw error;
    }
  }
}
