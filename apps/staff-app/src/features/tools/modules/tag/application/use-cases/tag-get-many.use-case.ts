import { Inject, Injectable } from '@nestjs/common';

import { PaginationHelper, type IPage } from '@acme-libs/toolkit';

import { TagGetManyModel } from '../../domain';
import { TAG_GET_MANY_REPOSITORY_PORT, type ITagGetManyRepositoryPort } from '../../outbound';
import type { ITagGetManyCommand, ITagView } from '../interfaces';

@Injectable()
export class TagGetManyUseCase {
  constructor(
    @Inject(TAG_GET_MANY_REPOSITORY_PORT)
    private readonly repository: ITagGetManyRepositoryPort,
  ) {}

  public async execute(command: ITagGetManyCommand): Promise<IPage<ITagView>> {
    const { limit, offset, page } = PaginationHelper.clampPageWindow({ query: command });
    const [records, total] = await this.repository.list({ limit, offset });
    const data = TagGetManyModel.toViewData(records);

    return PaginationHelper.toPage({ data, page, limit, total });
  }
}
