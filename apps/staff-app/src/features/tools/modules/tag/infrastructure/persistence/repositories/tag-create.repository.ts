import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { MysqlErrorHelper } from '@acme-libs/toolkit';
import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';

import {
  TAG_CREATE_REPOSITORY_PORT,
  TagCreateInsertOutcomeEnum,
  type ITagCreateInsertRecord,
  type ITagCreateQuery,
  type ITagCreateRecord,
  type ITagCreateRepositoryPort,
} from '../../../outbound';
import { TagPersistenceHost } from '../host/tag-persistence.host';

@Injectable()
export class TagCreateRepository extends TagPersistenceHost implements ITagCreateRepositoryPort {
  public static readonly provider: ClassProvider<ITagCreateRepositoryPort> = {
    provide: TAG_CREATE_REPOSITORY_PORT,
    useClass: TagCreateRepository,
  };

  constructor(
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
  ) {
    super();
  }

  public async insert(query: ITagCreateQuery): Promise<ITagCreateInsertRecord> {
    try {
      const tagId = await this.tagRepository.insertOne(query);

      return { outcome: TagCreateInsertOutcomeEnum.INSERTED, id: tagId };
    } catch (error) {
      if (MysqlErrorHelper.isDuplicateKey(error)) {
        return { outcome: TagCreateInsertOutcomeEnum.DUPLICATE };
      }

      throw error;
    }
  }

  public async findInserted(tagId: string): Promise<ITagCreateRecord> {
    return await this.createTagBuilder().forInserted(tagId).getOneOrFail();
  }
}
