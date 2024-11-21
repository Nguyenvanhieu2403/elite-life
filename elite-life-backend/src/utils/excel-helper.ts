import * as ExcelJS from 'exceljs';
import { ClassToClass, isNumeric } from './common-helper';
import { validate } from 'class-validator';
import { classToPlain, instanceToPlain, plainToClass } from 'class-transformer';
import logger from './logger';

export interface ExcelParamMap {
    [key: string]: number
}

export interface ExcelImportError {
    [rowNum: number]: ExcelImportErrorDetail
}
export interface ExcelImportErrorDetail {
    [property: string]: string[]
}

export interface ExcelExportDataFromDataResult<T extends object> {
    status: boolean,
    errors: ExcelImportError,
    data: T[]
}

export interface ExcelExportDataDto {
    [worksheetNumber: number | string]: {
        Data: any[],
        DataMap: string[],
        RowStart: number,
        ColStart: number
    }
}
type SomeConstructor<T> = {
    async(dto: T): Promise<boolean>;
};
export class ExcelHelper {
    static async ExportDataToExcel(
        pathTemplate: string,
        pathDist: string,
        excelExportDataDto: ExcelExportDataDto,
        extraFunction?: (workbook: ExcelJS.Workbook) => Promise<void>) {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(pathTemplate)
        if (extraFunction) await extraFunction(workbook);
        Object.keys(excelExportDataDto).forEach(worksheetNumber => {
            const worksheet = workbook.getWorksheet(isNumeric(worksheetNumber) ? parseInt(worksheetNumber) : worksheetNumber);
            const datas = excelExportDataDto[worksheetNumber].Data
            const dataMap = excelExportDataDto[worksheetNumber].DataMap
            const rowStart = excelExportDataDto[worksheetNumber].RowStart
            const colStart = excelExportDataDto[worksheetNumber].ColStart
            const data: { [key: string]: any }[] = [] = datas.map(data => {
                let objectConvert = {}
                dataMap.forEach(s => objectConvert[s] = data[s]);
                return objectConvert
            })
            let values: ExcelJS.CellValue[][] = []
            data.forEach(item => values.push(Object.values(item).map(value => value)));
            if (data.length > 2) worksheet.duplicateRow(rowStart, data.length - 2, true);

            worksheet.eachRow({ includeEmpty: true }, (rowData, rowIndex) => {
                if (rowIndex >= rowStart && values.length + rowStart - rowIndex > 0) {
                    let value = values[rowIndex - rowStart];
                    rowData.eachCell({ includeEmpty: true }, (cellValue, columnIndex) => {
                        if (columnIndex >= colStart && columnIndex <= value.length) {
                            const cell = worksheet.getCell(rowIndex, columnIndex);
                            cell.value = value[columnIndex - colStart];
                        }
                    });
                }
            })
        })

        await workbook.xlsx.writeFile(pathDist);
    }

    static RowToClass<T>(row: ExcelJS.Row, paramMap: ExcelParamMap, distClass: new () => T) {
        const valueConvert = row.values as ExcelJS.CellValue[] | { [key: string]: ExcelJS.CellValue }
        let dataRaw = {};
        Object.keys(paramMap).forEach(property => {
            let value = valueConvert[paramMap[property]]
            try {
                if (value?.formula)
                    dataRaw[property] = value.result
                else if (value?.hyperlink)
                    dataRaw[property] = value.text
                else dataRaw[property] = value

            } catch (error) {
                logger.info(value)
            }
        })
        return ClassToClass(dataRaw, distClass)
    }

    static IsRowBlank<T>(desClass: T) {
        // check exist value in property
        let isRowValid = false;
        Object.keys(desClass).forEach(key => {
            if (isRowValid == false) isRowValid = desClass[key] !== null && desClass[key] !== undefined && desClass[key].length > 0
        })
        return !isRowValid
    }

    static async ValidateDto<T extends object>(dto: T) {
        const errors = await validate(dto);
        let errorRowItem: ExcelImportErrorDetail = {};
        if (errors.length > 0) {
            for (const error of errors) {
                for (const constraint in error.constraints) {
                    if (error.constraints.hasOwnProperty(constraint)) {
                        if (!errorRowItem[error.property]) {
                            errorRowItem[error.property] = [];
                        }
                        errorRowItem[error.property].push(error.constraints[constraint]);
                    }
                }
            }
        }
        return errorRowItem
    }

    static async ExportDataFromExcel<T extends object>(ws: ExcelJS.Worksheet,
        rowStart: number,
        paramMap: ExcelParamMap,
        distClass: new () => T, funcAfterProcessRowBlank: { (dto: T): Promise<boolean>; } = null): Promise<ExcelExportDataFromDataResult<T>> {
        var dtos: T[] = []
        let errorRows: ExcelImportError = {}
        for (let i = rowStart; i < ws.rowCount + 1; i++) {
            try {
                let row = ws.getRow(i);
                let rowNumber = i - rowStart + 1
                const dto = this.RowToClass(row, paramMap, distClass);
                let isRowBlank = this.IsRowBlank(dto);
                if (isRowBlank == true) continue;
                if (funcAfterProcessRowBlank != undefined && !(await funcAfterProcessRowBlank(dto))) continue;

                // validate dto
                let errorRowItem: ExcelImportErrorDetail = await this.ValidateDto(dto)

                // handling error
                if (Object.keys(errorRowItem).length > 0) {
                    errorRows[i] = errorRowItem
                }

                dtos.push({
                    ...dto,
                    RowNumber: i
                });

            } catch (error) {
                console.log(error)
            }
        }

        return {
            status: Object.keys(errorRows).length == 0,
            errors: errorRows,
            data: dtos
        }
    }

}