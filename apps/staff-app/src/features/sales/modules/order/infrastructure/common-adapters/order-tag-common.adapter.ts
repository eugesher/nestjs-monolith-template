import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import {
  TAG_COMMON_PORT,
  TagCommonReplaceOutcomeEnum,
  TagCommonSubjectTypeEnum,
  type ITagCommonPort,
} from '@acme-staff/contracts/tag';

import {
  ORDER_TAG_PORT,
  OrderTagReplaceOutcomeEnum,
  type IOrderTagFindCommand,
  type IOrderTagFindOrderIdsCommand,
  type IOrderTagFindView,
  type IOrderTagPort,
  type IOrderTagReplaceCommand,
  type IOrderTagReplaceView,
} from '../../outbound';

@Injectable()
export class OrderTagCommonAdapter implements IOrderTagPort {
  public static readonly provider: ClassProvider<IOrderTagPort> = {
    provide: ORDER_TAG_PORT,
    useClass: OrderTagCommonAdapter,
  };

  private static readonly OUTCOMES: Record<
    TagCommonReplaceOutcomeEnum,
    IOrderTagReplaceView['outcome']
  > = {
    [TagCommonReplaceOutcomeEnum.REPLACED]: OrderTagReplaceOutcomeEnum.REPLACED,
    [TagCommonReplaceOutcomeEnum.TAG_NOT_FOUND]: OrderTagReplaceOutcomeEnum.TAG_NOT_FOUND,
  };

  constructor(
    @Inject(TAG_COMMON_PORT)
    private readonly tag: ITagCommonPort,
  ) {}

  public async find(command: IOrderTagFindCommand): Promise<IOrderTagFindView[]> {
    const { orderId } = command;

    return await this.tag.handleFind({
      subjectType: TagCommonSubjectTypeEnum.ORDER,
      subjectId: orderId,
    });
  }

  public async replace(command: IOrderTagReplaceCommand): Promise<IOrderTagReplaceView> {
    const { orderId, tagIds } = command;
    const replaceView = await this.tag.handleReplace({
      subjectType: TagCommonSubjectTypeEnum.ORDER,
      subjectId: orderId,
      tagIds,
    });
    const { outcome, tags, missingTagIds } = replaceView;

    return { outcome: OrderTagCommonAdapter.OUTCOMES[outcome], tags, missingTagIds };
  }

  public async findOrderIds(command: IOrderTagFindOrderIdsCommand): Promise<string[]> {
    const { tagId } = command;

    return await this.tag.handleFindSubjectIds({
      subjectType: TagCommonSubjectTypeEnum.ORDER,
      tagId,
    });
  }
}
