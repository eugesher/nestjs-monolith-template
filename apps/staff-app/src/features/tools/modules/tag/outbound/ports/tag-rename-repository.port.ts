import { TagRenameUpdateOutcomeEnum } from '../enums/tag-rename-update-outcome.enum';
import { ITagRenameQuery } from '../interfaces';

export interface ITagRenameRepositoryPort {
  update(query: ITagRenameQuery): Promise<TagRenameUpdateOutcomeEnum>;
}

export const TAG_RENAME_REPOSITORY_PORT = Symbol('TAG_RENAME_REPOSITORY_PORT');
