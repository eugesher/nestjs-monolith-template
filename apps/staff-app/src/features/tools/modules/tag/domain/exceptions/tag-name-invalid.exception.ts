import { TagErrorCodeEnum } from '../enums/tag-error-code.enum';
import { TagBaseException } from './base/tag-base.exception';

export class TagNameInvalidException extends TagBaseException {
  public readonly code = TagErrorCodeEnum.TAG_NAME_INVALID;

  constructor(
    maxLength: number,
    message = `Tag.name must be a non-empty string of at most ${maxLength} characters`,
  ) {
    super(message);
  }
}
