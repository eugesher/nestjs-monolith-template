import { Inject, Injectable } from '@nestjs/common';

import { IPage, PaginationHelper } from '@acme-libs/toolkit';

import { TagModel } from '../../domain';
import { TAG_GET_MANY_REPOSITORY_PORT, type ITagGetManyRepositoryPort } from '../../outbound';
import { ITagGetManyCommand, ITagView } from '../interfaces';

@Injectable()
export class TagGetManyUseCase {
  constructor(
    @Inject(TAG_GET_MANY_REPOSITORY_PORT)
    private readonly repository: ITagGetManyRepositoryPort,
  ) {}

  public async execute(command: ITagGetManyCommand): Promise<IPage<ITagView>> {
    const { page, limit } = command;
    const pageWindow = PaginationHelper.clampPageWindow(page, limit);
    const [records, total] = await this.repository.list({ ...pageWindow });
    const data = records.map((record) => {
      const tag = TagModel.reconstitute(record);

      return tag.toView();
    });

    return PaginationHelper.toPage(data, total, pageWindow);
  }
}
