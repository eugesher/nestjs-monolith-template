import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, Matches } from 'class-validator';

export class ProductTagsReplaceRequestDto {
  @ApiProperty({
    example: ['300', '301'],
    description: 'The ids of the tags the product keeps, at most 20; an empty list clears them',
  })
  @IsArray()
  @ArrayMaxSize(20)
  @Matches(/^[1-9]\d{0,19}$/, { each: true, message: 'each tagId must be a positive integer' })
  public tagIds: string[];
}
