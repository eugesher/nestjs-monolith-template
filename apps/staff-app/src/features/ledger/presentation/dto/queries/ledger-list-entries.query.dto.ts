import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class LedgerListEntriesQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  public page?: number;

  @ApiPropertyOptional({ example: 20, description: 'Capped at 100' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  public limit?: number;

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
