import { Injectable } from '@nestjs/common';

import type {
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
    private readonly find: TagCommonFindUseCase,
    private readonly findSubjectIds: TagCommonFindSubjectIdsUseCase,
    private readonly replace: TagCommonReplaceUseCase,
  ) {}

  public async handleFind(command: ITagCommonFindCommand): Promise<ITagCommonTagView[]> {
    return await this.find.execute(command);
  }

  public async handleReplace(command: ITagCommonReplaceCommand): Promise<ITagCommonReplaceView> {
    return await this.replace.execute(command);
  }

  public async handleFindSubjectIds(command: ITagCommonFindSubjectIdsCommand): Promise<string[]> {
    return await this.findSubjectIds.execute(command);
  }
}
