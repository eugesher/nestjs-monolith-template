import type { Tag } from '@acme-staff/common/entities';

export type ITagAccessRecord = Pick<Tag, 'id' | 'name' | 'createdAt' | 'updatedAt'>;
