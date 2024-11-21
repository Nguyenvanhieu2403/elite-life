import { ValidationOptions } from "class-validator";

export interface ResponseData<T = any> {
    status: boolean,
    message?: string | { [key: string]: string } | any,
    code?: number,
    data?: T,
    total?: number,
    token?: string,
    tokenExpires?: Date | null
};

export class ComboData {
    constructor(partial: Partial<ComboData>) {
        Object.assign(this, partial);
    }

    Text: string

    Value: string | number

    Extra?: any | {
        [key: string]: any
    }
}

export class ExportBaseDto {
    constructor(partial?: Partial<ExportBaseDto>)
    constructor(partial: Partial<ExportBaseDto>) {
        if (partial) Object.assign(this, partial);
    }

    Name: string | number = null;
    Id: string | number = null;
    Extra1?: string | number = null;
    Extra2?: string | number = null;
    Extra3?: string | number = null;
};

export class ImportErrorDto {
    RowNum: string = null;
    Description: string = null;
};

export enum HandlesValidateMessageEnums {
    IsNotEmpty,
    IsNumber,
    IsDate,
    IsArray,
    ArrayNotEmpty,
    IsEmail,
    IsPositive
}

export function HandlesValidateMessage(handlesValidateMessageEnums?: HandlesValidateMessageEnums, validationOptions?: ValidationOptions): ValidationOptions | null {
    return {
        ...validationOptions,
        message(validationArguments) {
            switch (handlesValidateMessageEnums) {
                case HandlesValidateMessageEnums.IsNotEmpty:
                    return `${validationArguments.property} không được để trống`
                case HandlesValidateMessageEnums.IsNumber:
                    return `${validationArguments.property} phải là định dạng số`
                case HandlesValidateMessageEnums.IsDate:
                    return `${validationArguments.property} phải là định dạng ngày`
                case HandlesValidateMessageEnums.IsArray:
                    return `${validationArguments.property} phải là định dạng mảng`
                case HandlesValidateMessageEnums.ArrayNotEmpty:
                    return `${validationArguments.property} không được để trống`
                case HandlesValidateMessageEnums.IsEmail:
                    return `${validationArguments.property} phải là định dạng email`
                case HandlesValidateMessageEnums.IsPositive:
                    return `${validationArguments.property} phải > 0`
                default:
                    break;
            }
        },
    }
}
