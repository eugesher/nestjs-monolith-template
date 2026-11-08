import { ApiResponseProperty } from '@nestjs/swagger';

export class UserRolesResponseDto {
  @ApiResponseProperty()
  public id: string;

  @ApiResponseProperty({ example: ['2', '3'] })
  public roleIds: string[];
}
