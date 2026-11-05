import { Inject, Injectable } from '@nestjs/common';

import {
  type ITagCommonPort,
  TAG_COMMON_PORT,
  TagCommonReplaceOutcomeEnum,
  TagCommonSubjectTypeEnum,
} from '@acme-staff/contracts/tag';

import {
  IOrderTagFindCommand,
  IOrderTagFindOrderIdsCommand,
  IOrderTagFindView,
  IOrderTagPort,
  IOrderTagReplaceCommand,
  IOrderTagReplaceView,
} from '../../outbound';

@Injectable()
export class OrderTagCommonAdapter implements IOrderTagPort {
  private static readonly OUTCOMES: Record<
    TagCommonReplaceOutcomeEnum,
    IOrderTagReplaceView['outcome']
  > = {
    [TagCommonReplaceOutcomeEnum.REPLACED]: 'replaced',
    [TagCommonReplaceOutcomeEnum.TAG_NOT_FOUND]: 'tag-not-found',
  };

  constructor(
    @Inject(TAG_COMMON_PORT)
    private readonly tag: ITagCommonPort,
  ) {}

  public async find(command: IOrderTagFindCommand): Promise<IOrderTagFindView[]> {
    const { orderId } = command;

    return await this.tag.find({ subjectType: TagCommonSubjectTypeEnum.ORDER, subjectId: orderId });
  }

  public async replace(command: IOrderTagReplaceCommand): Promise<IOrderTagReplaceView> {
    const { orderId, tagIds } = command;
    const replaced = await this.tag.replace({
      subjectType: TagCommonSubjectTypeEnum.ORDER,
      subjectId: orderId,
      tagIds,
    });
    const { outcome, tags, missingTagIds } = replaced;

    return { outcome: OrderTagCommonAdapter.OUTCOMES[outcome], tags, missingTagIds };
  }

  public async findOrderIds(command: IOrderTagFindOrderIdsCommand): Promise<string[]> {
    const { tagId } = command;

    return await this.tag.findSubjectIds({ subjectType: TagCommonSubjectTypeEnum.ORDER, tagId });
  }
}
