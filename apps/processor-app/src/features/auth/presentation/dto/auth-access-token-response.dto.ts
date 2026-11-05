import { ApiResponseProperty } from '@nestjs/swagger';

export class AuthAccessTokenResponseDto {
  @ApiResponseProperty()
  public accessToken: string;
}
