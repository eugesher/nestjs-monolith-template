import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { MysqlErrorHelper } from '@acme-libs/toolkit';
import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';

import {
  ITagCreateInsertRecord,
  ITagCreateQuery,
  ITagCreateRecord,
  ITagCreateRepositoryPort,
  TAG_CREATE_REPOSITORY_PORT,
  TagCreateInsertOutcomeEnum,
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
      const id = await this.tagRepository.insertOne(query);

      return { outcome: TagCreateInsertOutcomeEnum.INSERTED, id };
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
