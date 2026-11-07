import {
  ITagCommonReplaceFindLinkedQuery,
  ITagCommonReplaceLinkQuery,
  ITagCommonReplaceSubjectTagRecord,
  ITagCommonReplaceTagRecord,
  ITagCommonReplaceUnlinkQuery,
} from '../interfaces';

export interface ITagCommonReplaceRepositoryPort {
  lockTags(tagIds: string[]): Promise<ITagCommonReplaceTagRecord[]>;
  findLinked(query: ITagCommonReplaceFindLinkedQuery): Promise<ITagCommonReplaceSubjectTagRecord[]>;
  link(query: ITagCommonReplaceLinkQuery): Promise<void>;
  unlink(query: ITagCommonReplaceUnlinkQuery): Promise<void>;
}

export const TAG_COMMON_REPLACE_REPOSITORY_PORT = Symbol('TAG_COMMON_REPLACE_REPOSITORY_PORT');
