import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { MysqlErrorHelper } from '@acme-libs/toolkit';

import { TagModel, TagNameTakenException } from '../../domain';
import { type ITagCreateRepositoryPort, TAG_CREATE_REPOSITORY_PORT } from '../../outbound';
import { ITagCreateCommand, ITagView } from '../interfaces';

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
    const view = created.toView();

    this.logger.info({ tagId: view.id, name: view.name }, 'Tag created');

    return view;
  }

  private async insert(name: string): Promise<string> {
    try {
      return await this.repository.insert({ name });
    } catch (error) {
      if (MysqlErrorHelper.isDuplicateKey(error)) {
        throw new TagNameTakenException(name);
      }

      throw error;
    }
  }
}
