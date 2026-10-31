import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class NoteGetManyRequestDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  public page?: number;

  @ApiPropertyOptional({ example: 20, description: 'Capped at 100' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  public size?: number;

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
