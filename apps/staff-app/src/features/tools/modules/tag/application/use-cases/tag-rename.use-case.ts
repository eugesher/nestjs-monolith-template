import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, type PinoLogger } from 'nestjs-pino';

import { TagNameTakenException, type TagModel } from '../../domain';
import {
  TAG_RENAME_REPOSITORY_PORT,
  TagRenameUpdateOutcomeEnum,
  type ITagRenameRepositoryPort,
} from '../../outbound';
import { TagAccessService } from '../services/tag-access.service';
import type { ITagRenameCommand, ITagView } from '../interfaces';

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
      return tag.toSnapshot();
    }

    await this.update(tag);

    const renamed = await this.accessService.load({ tagId });

    this.logger.info({ tagId, nameAsRead, name: renamed.name }, 'Tag renamed');

    return renamed.toSnapshot();
  }

  private async update(tag: TagModel): Promise<void> {
    const { id, name } = tag;

    const outcome = await this.repository.update({ id, name });

    if (outcome === TagRenameUpdateOutcomeEnum.DUPLICATE) {
      throw new TagNameTakenException(name);
    }
  }
}
