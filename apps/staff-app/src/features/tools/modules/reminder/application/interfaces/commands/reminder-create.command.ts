import type { Maybe } from '@acme-libs/toolkit';

export interface IReminderCreateCommand {
  ownerId: string;
  title: string;
  body: Maybe<string>;
  dueOn: string;
}
