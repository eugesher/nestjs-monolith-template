import { ApiResponseProperty } from '@nestjs/swagger';

export class AuthMeResponseDto {
  @ApiResponseProperty()
  public id: string;

  @ApiResponseProperty({ example: 'admin@example.com' })
  public email: string;

  @ApiResponseProperty({ example: ['admin'] })
  public roles: string[];
}
