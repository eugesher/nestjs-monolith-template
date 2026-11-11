import type { Tag } from '@acme-staff/common/entities';

export type ITagRenameQuery = Pick<Tag, 'id' | 'name'>;
