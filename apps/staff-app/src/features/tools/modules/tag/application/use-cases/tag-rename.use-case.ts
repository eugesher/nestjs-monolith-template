import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { MysqlErrorHelper } from '@acme-libs/toolkit';

import { TagModel, TagNameTakenException } from '../../domain';
import { type ITagRenameRepositoryPort, TAG_RENAME_REPOSITORY_PORT } from '../../outbound';
import { ITagRenameCommand, ITagView } from '../interfaces';
import { TagAccessService } from '../services/tag-access.service';

@Injectable()
export class TagRenameUseCase {
  constructor(
    private readonly accessService: TagAccessService,
    @Inject(TAG_RENAME_REPOSITORY_PORT)
    private readonly repository: ITagRenameRepositoryPort,
    @InjectPinoLogger(TagRenameUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: ITagRenameCommand): Promise<ITagView> {
    const { tagId, name } = command;
    const tag = await this.accessService.load({ tagId });
    const nameAsRead = tag.name;

    tag.rename(name);

    if (tag.name === nameAsRead) {
      return tag.toView();
    }

    await this.update(tag);

    const renamed = await this.accessService.load({ tagId });

    this.logger.info({ tagId, nameAsRead, name: renamed.name }, 'Tag renamed');

    return renamed.toView();
  }

  private async update(tag: TagModel): Promise<void> {
    const { id, name } = tag;

    try {
      await this.repository.update({ id, name });
    } catch (error) {
      if (MysqlErrorHelper.isDuplicateKey(error)) {
        throw new TagNameTakenException(name);
      }

      throw error;
    }
  }
}
