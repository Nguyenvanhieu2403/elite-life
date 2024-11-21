import { randomStringGenerator } from "@nestjs/common/utils/random-string-generator.util";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsBooleanString, IsEmail, IsEmpty, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength, isEmpty } from "class-validator";
import { timeStamp } from "console";
import { lowerCaseTransformer } from "src/utils/transformers/lower-case.transformer";
import { stringToBooleanTransformer } from "src/utils/transformers/string-to-boolean.transformer";
import { stringToDateTransformer } from "src/utils/transformers/string-to-date.transformer";
import { stringToNumberTransformer } from "src/utils/transformers/string-to-number.transformer";

export class GetTreeCollaboratorDto {
    constructor(partial: Partial<GetTreeCollaboratorDto>) {
        Object.assign(this, partial);
    }

    key: string | number;
    label: string;
    children: GetTreeCollaboratorDto[]
}

export class GetTreeRawCollaboratorDto {
    Id: number;
    UserName: string;
    Name: string;
    RankName: string;
    ParentId: number | null;
    Value: number;
}
