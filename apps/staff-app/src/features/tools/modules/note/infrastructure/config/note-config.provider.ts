import { ConfigValueProvider } from '@acme-libs/config';

import { NOTE_OCC_RETRY_ATTEMPTS_TOKEN } from '../../outbound';

export const NoteConfigOccRetryAttemptsProvider = ConfigValueProvider.provide<number>({
  injectionToken: NOTE_OCC_RETRY_ATTEMPTS_TOKEN,
  configProperty: 'OCC_RETRY_ATTEMPTS',
});
