import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";
import { OtherLists } from "src/database/entities/otherLists.entity";
import { ApplicationTypeEnums } from "src/utils/enums.utils";

export class CreatePermissionDto {
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
