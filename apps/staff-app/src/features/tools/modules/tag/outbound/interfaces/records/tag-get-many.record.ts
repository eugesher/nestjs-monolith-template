import type { Tag } from '@acme-staff/common/entities';

export type ITagGetManyRecord = [Pick<Tag, 'id' | 'name' | 'createdAt' | 'updatedAt'>[], number];
