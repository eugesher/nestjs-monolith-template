import { TagExceptionCodeEnum } from '../enums/tag-exception-code.enum';
import { TagBaseException } from './base/tag-base.exception';

export class TagNameInvalidException extends TagBaseException {
  public readonly code = TagExceptionCodeEnum.TAG_NAME_INVALID;

  constructor(
    maxLength: number,
    message = `Tag.name must be a non-empty string of at most ${maxLength} characters`,
  ) {
    super(message);
  }
}
