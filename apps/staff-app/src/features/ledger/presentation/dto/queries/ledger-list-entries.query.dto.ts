import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

import { PageQueryDto } from '@acme-libs/http';

export class LedgerListEntriesQueryDto extends PageQueryDto {
  @ApiPropertyOptional({ example: 'product' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  public subjectType?: string;

  @ApiPropertyOptional({ example: '12' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  public subjectId?: string;

  @ApiPropertyOptional({ description: 'The correlation id of the request that caused the entry' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  public correlationId?: string;
}
