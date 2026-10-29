import { ApiResponseProperty } from '@nestjs/swagger';

export class SessionAccessTokenResponseDto {
  @ApiResponseProperty()
  public accessToken: string;
}
