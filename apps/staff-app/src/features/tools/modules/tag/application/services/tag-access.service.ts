import { Inject, Injectable } from '@nestjs/common';

import { TagModel, TagNotFoundException } from '../../domain';
import { type ITagAccessRepositoryPort, TAG_ACCESS_REPOSITORY_PORT } from '../../outbound';
import { ITagAccessLoadCommand } from '../interfaces';

@Injectable()
export class TagAccessService {
  constructor(
    @Inject(TAG_ACCESS_REPOSITORY_PORT)
    private readonly repository: ITagAccessRepositoryPort,
  ) {}

  public async load(command: ITagAccessLoadCommand): Promise<TagModel> {
    const { tagId } = command;
    const record = await this.repository.findById(tagId);

    if (!record) {
      throw new TagNotFoundException(tagId);
    }

    return TagModel.reconstitute(record);
  }
}
