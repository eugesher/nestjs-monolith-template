import { NOTE_OCC_RETRY_ATTEMPTS_TOKEN } from '../../../outbound';
import { NoteConfigOccRetryAttemptsProvider } from '../note-config.provider';

describe('note config providers', () => {
  let getOrThrow: jest.Mock;

  beforeEach(() => {
    getOrThrow = jest.fn().mockReturnValue(7);
  });

  describe('NoteConfigOccRetryAttemptsProvider', () => {
    it('provides OCC_RETRY_ATTEMPTS under the note token', () => {
      const value = NoteConfigOccRetryAttemptsProvider.useFactory({ getOrThrow });

      expect(NoteConfigOccRetryAttemptsProvider.provide).toBe(NOTE_OCC_RETRY_ATTEMPTS_TOKEN);
      expect(value).toBe(7);
      expect(getOrThrow).toHaveBeenCalledWith('OCC_RETRY_ATTEMPTS');
    });
  });
});
