import { Tag } from '@acme-staff/common/entities';

import { TagCreateInsertOutcomeEnum } from '../../enums/tag-create-insert-outcome.enum';

export type ITagCreateRecord = Pick<Tag, 'id' | 'name' | 'createdAt' | 'updatedAt'>;

export type ITagCreateInsertRecord =
  | (Pick<Tag, 'id'> & { outcome: TagCreateInsertOutcomeEnum.INSERTED })
  | { outcome: TagCreateInsertOutcomeEnum.DUPLICATE };
