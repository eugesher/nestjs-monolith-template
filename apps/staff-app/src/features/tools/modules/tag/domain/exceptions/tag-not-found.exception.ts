import { TagExceptionCodeEnum } from '../enums/tag-exception-code.enum';
import { TagBaseException } from './base/tag-base.exception';

export class TagNotFoundException extends TagBaseException {
  public readonly code = TagExceptionCodeEnum.TAG_NOT_FOUND;

  constructor(tagId: string, message = `Tag ${tagId} was not found`) {
    super(message);
  }
}
