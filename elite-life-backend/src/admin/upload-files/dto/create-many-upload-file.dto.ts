import { FileTypeEnums } from "src/utils/enums.utils";

export class CreateManyUploadFileDto {
    ForId: number;
    FileId: number;
    FileName: string;
    Type: FileTypeEnums;
}
