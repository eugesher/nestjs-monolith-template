import {
  ITagCommonFindCommand,
  ITagCommonFindSubjectIdsCommand,
  ITagCommonReplaceCommand,
  ITagCommonReplaceView,
  ITagCommonTagView,
} from '../interfaces';

export interface ITagCommonPort {
  handleFind(command: ITagCommonFindCommand): Promise<ITagCommonTagView[]>;
  handleReplace(command: ITagCommonReplaceCommand): Promise<ITagCommonReplaceView>;
  handleFindSubjectIds(command: ITagCommonFindSubjectIdsCommand): Promise<string[]>;
}

export const TAG_COMMON_PORT = Symbol('TAG_COMMON_PORT');
