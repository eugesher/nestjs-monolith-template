import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, type PinoLogger } from 'nestjs-pino';

import { TagModel, TagNameTakenException } from '../../domain';
import {
  TAG_CREATE_REPOSITORY_PORT,
  TagCreateInsertOutcomeEnum,
  type ITagCreateRepositoryPort,
} from '../../outbound';
import type { ITagCreateCommand, ITagView } from '../interfaces';

@Injectable()
export class TagCreateUseCase {
  constructor(
    @Inject(TAG_CREATE_REPOSITORY_PORT)
    private readonly repository: ITagCreateRepositoryPort,
    @InjectPinoLogger(TagCreateUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: ITagCreateCommand): Promise<ITagView> {
    const { name } = command;
    const tagDraft = TagModel.createDraft({ name });
    const tagId = await this.insert(tagDraft.name);
    const tagRecord = await this.repository.findInserted(tagId);
    const createdTag = TagModel.reconstitute(tagRecord);
    const tagView = createdTag.toSnapshot();

    this.logger.info({ tagId: tagView.id, name: tagView.name }, 'Tag created');

    return tagView;
  }

  private async insert(name: string): Promise<string> {
    const insertResult = await this.repository.insert({ name });

    if (insertResult.outcome === TagCreateInsertOutcomeEnum.DUPLICATE) {
      throw new TagNameTakenException(name);
    }

    return insertResult.id;
  }
}
