import { TagExceptionCodeEnum } from '../enums/tag-exception-code.enum';
import { TagBaseException } from './base/tag-base.exception';

export class TagNameTakenException extends TagBaseException {
  public readonly code = TagExceptionCodeEnum.TAG_NAME_TAKEN;

  constructor(name: string, message = `A tag named ${name} already exists`) {
    super(message);
  }
}
