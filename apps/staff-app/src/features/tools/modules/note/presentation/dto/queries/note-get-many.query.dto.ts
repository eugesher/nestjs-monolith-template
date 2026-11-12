import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, type TransformFnParams } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

import { PageQueryDto } from '@acme-libs/http';

export class NoteGetManyQueryDto extends PageQueryDto {
  @ApiPropertyOptional({ example: 'product', description: 'Only together with subjectId' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z][a-z-]{1,63}$/, { message: 'subjectType must be lowercase letters and dashes' })
  public subjectType?: string;

  @ApiPropertyOptional({ example: '42', description: 'Only together with subjectType' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  public subjectId?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Transform((params: TransformFnParams): unknown => {
    if (params.value === 'true') {
      return true;
    }

    if (params.value === 'false') {
      return false;
    }

    return params.value;
  })
  @IsBoolean()
  public resolved?: boolean;
}
