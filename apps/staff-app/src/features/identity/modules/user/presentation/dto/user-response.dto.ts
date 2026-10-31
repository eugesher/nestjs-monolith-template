import { ApiResponseProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiResponseProperty()
  public id: string;

  @ApiResponseProperty({ example: 'editor@example.com' })
  public email: string;
}
