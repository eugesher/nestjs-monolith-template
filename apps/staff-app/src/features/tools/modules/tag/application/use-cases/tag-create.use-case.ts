import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

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
    const draft = TagModel.createDraft({ name });
    const tagId = await this.insert(draft.name);
    const record = await this.repository.findInserted(tagId);
    const created = TagModel.reconstitute(record);
    const view = created.toSnapshot();

    this.logger.info({ tagId: view.id, name: view.name }, 'Tag created');

    return view;
  }

  private async insert(name: string): Promise<string> {
    const inserted = await this.repository.insert({ name });

    if (inserted.outcome === TagCreateInsertOutcomeEnum.DUPLICATE) {
      throw new TagNameTakenException(name);
    }

    return inserted.id;
  }
}
