import { randomStringGenerator } from "@nestjs/common/utils/random-string-generator.util";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsEnum, IsOptional, IsEmail, MinLength, IsNumber } from "class-validator";
import { Roles } from "src/database/entities/user/roles.entity";
import { ApplicationTypeEnums } from "src/utils/enums.utils";
import { lowerCaseTransformer } from "src/utils/transformers/lower-case.transformer";

export class GetUserDto {
    UserName: string;

    RoleId: number;

    RoleName: string;

    DisplayName: string | null;

    Email: string;

    Mobile: string;

    Address: string | null;

    Permission: string;

    ApplicationType: ApplicationTypeEnums
}
