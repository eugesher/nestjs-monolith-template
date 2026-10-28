import { Maybe } from '@acme-libs/toolkit';

export class AuthClaimHelper {
  public static holdsAny(
    required: Maybe<readonly string[]>,
    held: Maybe<readonly string[]>,
  ): boolean {
    if (!required || required.length === 0) {
      return true;
    }

    if (!held) {
      return false;
    }

    return required.some((value) => held.includes(value));
  }
}
