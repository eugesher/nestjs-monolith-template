import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import {
  TAG_COMMON_PORT,
  TagCommonReplaceOutcomeEnum,
  TagCommonSubjectTypeEnum,
  type ITagCommonPort,
} from '@acme-staff/contracts/tag';

import {
  PRODUCT_TAG_PORT,
  ProductTagReplaceOutcomeEnum,
  type IProductTagFindCommand,
  type IProductTagFindProductIdsCommand,
  type IProductTagFindView,
  type IProductTagPort,
  type IProductTagReplaceCommand,
  type IProductTagReplaceView,
} from '../../outbound';

@Injectable()
export class ProductTagCommonAdapter implements IProductTagPort {
  public static readonly provider: ClassProvider<IProductTagPort> = {
    provide: PRODUCT_TAG_PORT,
    useClass: ProductTagCommonAdapter,
  };

  private static readonly OUTCOMES: Record<
    TagCommonReplaceOutcomeEnum,
    IProductTagReplaceView['outcome']
  > = {
    [TagCommonReplaceOutcomeEnum.REPLACED]: ProductTagReplaceOutcomeEnum.REPLACED,
    [TagCommonReplaceOutcomeEnum.TAG_NOT_FOUND]: ProductTagReplaceOutcomeEnum.TAG_NOT_FOUND,
  };

  constructor(
    @Inject(TAG_COMMON_PORT)
    private readonly tag: ITagCommonPort,
  ) {}

  public async find(command: IProductTagFindCommand): Promise<IProductTagFindView[]> {
    const { productId } = command;

    return await this.tag.handleFind({
      subjectType: TagCommonSubjectTypeEnum.PRODUCT,
      subjectId: productId,
    });
  }

  public async replace(command: IProductTagReplaceCommand): Promise<IProductTagReplaceView> {
    const { productId, tagIds } = command;
    const replaced = await this.tag.handleReplace({
      subjectType: TagCommonSubjectTypeEnum.PRODUCT,
      subjectId: productId,
      tagIds,
    });
    const { outcome, tags, missingTagIds } = replaced;

    return { outcome: ProductTagCommonAdapter.OUTCOMES[outcome], tags, missingTagIds };
  }

  public async findProductIds(command: IProductTagFindProductIdsCommand): Promise<string[]> {
    const { tagId } = command;

    return await this.tag.handleFindSubjectIds({
      subjectType: TagCommonSubjectTypeEnum.PRODUCT,
      tagId,
    });
  }
}
