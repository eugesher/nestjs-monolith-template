import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { TRANSACTION_PORT, type ITransactionPort } from '@acme-libs/contracts/database';
import {
  ITagCommonReplaceCommand,
  ITagCommonReplaceView,
  TagCommonReplaceOutcomeEnum,
} from '@acme-staff/contracts/tag';

import { TagCommonSubjectTagsModel } from '../../domain';
import {
  TAG_COMMON_REPLACE_REPOSITORY_PORT,
  type ITagCommonReplaceRepositoryPort,
} from '../../outbound';

@Injectable()
export class TagCommonReplaceUseCase {
  constructor(
    @Inject(TAG_COMMON_REPLACE_REPOSITORY_PORT)
    private readonly repository: ITagCommonReplaceRepositoryPort,
    @Inject(TRANSACTION_PORT)
    private readonly transaction: ITransactionPort,
    @InjectPinoLogger(TagCommonReplaceUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: ITagCommonReplaceCommand): Promise<ITagCommonReplaceView> {
    const { subjectType, subjectId } = command;
    const view = await this.transaction.run(() => this.replace(command));
    const { outcome, tags } = view;

    if (outcome === TagCommonReplaceOutcomeEnum.REPLACED) {
      const tagIds = tags.map((tag) => tag.id);

      this.logger.info({ subjectType, subjectId, tagIds }, 'Subject tags replaced');
    }

    return view;
  }

  private async replace(command: ITagCommonReplaceCommand): Promise<ITagCommonReplaceView> {
    const { subjectType, subjectId, tagIds } = command;
    const tags = await this.repository.lockTags(tagIds);
    const foundTagIds = tags.map((tag) => tag.id);
    const missingTagIds = TagCommonSubjectTagsModel.missingTagIds(tagIds, foundTagIds);

    if (missingTagIds.length > 0) {
      return { outcome: TagCommonReplaceOutcomeEnum.TAG_NOT_FOUND, tags: [], missingTagIds };
    }

    const linked = await this.repository.findLinked({ subjectType, subjectId });
    const linkedTagIds = linked.map((link) => link.tagId);
    const subjectTags = TagCommonSubjectTagsModel.reconstitute({ tagIds: linkedTagIds });
    const { linkTagIds, unlinkTagIds } = subjectTags.replace(foundTagIds);

    await this.repository.unlink({ subjectType, subjectId, tagIds: unlinkTagIds });
    await this.repository.link({ subjectType, subjectId, tagIds: linkTagIds });

    const views = tags.map((tag) => ({ id: tag.id, name: tag.name }));

    return { outcome: TagCommonReplaceOutcomeEnum.REPLACED, tags: views, missingTagIds: [] };
  }
}
