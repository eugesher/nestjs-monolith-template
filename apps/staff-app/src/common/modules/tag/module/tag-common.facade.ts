import { Injectable } from '@nestjs/common';

import {
  ITagCommonFindCommand,
  ITagCommonFindSubjectIdsCommand,
  ITagCommonPort,
  ITagCommonReplaceCommand,
  ITagCommonReplaceView,
  ITagCommonTagView,
} from '@acme-staff/contracts/tag';

import {
  TagCommonFindSubjectIdsUseCase,
  TagCommonFindUseCase,
  TagCommonReplaceUseCase,
} from '../application';

@Injectable()
export class TagCommonFacade implements ITagCommonPort {
  constructor(
    private readonly tagCommonFind: TagCommonFindUseCase,
    private readonly tagCommonFindSubjectIds: TagCommonFindSubjectIdsUseCase,
    private readonly tagCommonReplace: TagCommonReplaceUseCase,
  ) {}

  public async find(command: ITagCommonFindCommand): Promise<ITagCommonTagView[]> {
    return await this.tagCommonFind.execute(command);
  }

  public async replace(command: ITagCommonReplaceCommand): Promise<ITagCommonReplaceView> {
    return await this.tagCommonReplace.execute(command);
  }

  public async findSubjectIds(command: ITagCommonFindSubjectIdsCommand): Promise<string[]> {
    return await this.tagCommonFindSubjectIds.execute(command);
  }
}
