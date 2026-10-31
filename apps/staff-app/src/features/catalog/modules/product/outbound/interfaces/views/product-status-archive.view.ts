import { Maybe } from '@acme-libs/toolkit';

export interface IProductStatusArchiveView {
  outcome: 'archived' | 'already-archived' | 'not-found' | 'version-mismatch';
  currentVersion: Maybe<number>;
}
