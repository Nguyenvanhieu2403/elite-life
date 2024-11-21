import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";
import { ApplicationTypeEnums } from "src/utils/enums.utils";

export class CreatePermissionsSaleDto {
    @ApiProperty({})
    @IsOptional()
    Code: string | null;

    @ApiProperty({})
    @IsOptional()
    Name: string | null;

    @ApiProperty({})
    @IsOptional()
    Action: string | null;

    @ApiProperty({})
    @IsOptional()
    Controller: string | null;

    ApplicationType: ApplicationTypeEnums;
}
