import { Tag } from '@acme-staff/common/entities';

export type ITagCreateRecord = Pick<Tag, 'id' | 'name' | 'createdAt' | 'updatedAt'>;
