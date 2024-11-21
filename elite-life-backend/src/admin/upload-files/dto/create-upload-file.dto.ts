import { FileTypeEnums } from "src/utils/enums.utils";

export class CreateUploadFileDto {
    ForId: number;
    FileId: number;
    FileName: string;
    Type: FileTypeEnums;
}
