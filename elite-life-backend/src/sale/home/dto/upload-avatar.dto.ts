import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class UploadAvatarDto {
    @ApiProperty({ type: 'string', format: 'binary' })
    @IsOptional()
    File: Express.Multer.File | null = null;
}
