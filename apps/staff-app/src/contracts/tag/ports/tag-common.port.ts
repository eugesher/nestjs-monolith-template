import {
  ITagCommonFindCommand,
  ITagCommonFindSubjectIdsCommand,
  ITagCommonReplaceCommand,
  ITagCommonReplaceView,
  ITagCommonTagView,
} from '../interfaces';

export interface ITagCommonPort {
  find(command: ITagCommonFindCommand): Promise<ITagCommonTagView[]>;
  replace(command: ITagCommonReplaceCommand): Promise<ITagCommonReplaceView>;
  findSubjectIds(command: ITagCommonFindSubjectIdsCommand): Promise<string[]>;
}

export const TAG_COMMON_PORT = Symbol('TAG_COMMON_PORT');
