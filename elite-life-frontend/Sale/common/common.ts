import { FilterMatchMode } from "primereact/api";
import { LazyStateFilterObject, LazyStateObject } from "../types/models/filter";
import moment from "moment";
import saveAs from 'file-saver';
import { InputValue } from "../types/models/dropdownInput";
export enum RankEnums {
    undefined = "",
    None = "None",
    V = "Vip",
    V1 = "Vip1",
    V2 = "Vip2",
    V3 = "Vip3",
    V4 = "Vip4",
    V5 = "Vip5",
}
export function processFilter(lazyState: LazyStateObject) {
    var filters: LazyStateFilterObject = {};
    let properties = Object.keys(lazyState.filters);
    properties.forEach(property => {
        let filter = lazyState.filters[property]
        if (filter.value != null || filter.value?.length > 0) {
            switch (filter.matchMode) {
                case FilterMatchMode.DATE_AFTER:
                case FilterMatchMode.DATE_BEFORE:
                case FilterMatchMode.DATE_IS:
                case FilterMatchMode.DATE_IS_NOT:
                    if (filter.value) {
                        filter.value = moment(filter.value).format('DD/MM/YYYY');
                    }
                    break;
                case FilterMatchMode.EQUALS:
                    if (filter.value == "") {
                        filter.value = null;
                    }
                default:
                    break;
            }
            filters[property] = lazyState.filters[property];
        }
    })
    return filters;
}

export function formatDate(value: string) {
    if (value == "" || value == null || value == undefined) {
        return "";
    }
    return moment(moment(value).utc().toString()).utc().format("DD/MM/YYYY")
};
export function formatDateTime(value: string) {
    if (value == "" || value == null || value == undefined) {
        return "";
    }
    return moment(moment(value).utc().toString()).utc().format("DD/MM/YYYY HH:mm:ss")
};
export function isJsonString(value: any) {
    var status: boolean = false;
    try {
        status = typeof value === 'object' ? true : false;
    } catch (e) {
        return status;
    }
    return status;
}

const createExcelRow = (ref: any, item: any) => {
    const columnHeaders = ref.current.props.children;
    const row: { [key: string]: any } = {};
    columnHeaders.forEach((header: any, index: number) => {
        if (header.props.exportable == false) {
            return;
        }
        const headerProp = String(header.props.field);
        if (headerProp.includes(".")) {
            const arr = headerProp.split(".");
            const firstField = arr[0];
            const secondaryField = arr.slice(-1)[0]
            if (item[firstField] != null) {
                row[header.props.header] = item[firstField][secondaryField] ?? "";
            }
        }
        else {
            if (header.props.dataType == "date") {
                row[header.props.header] = formatDate(item[header.props.field])
            }
            else {
                row[header.props.header] = item[header.props.field];
            }
        }

    });
    return row;
};
export function exportExcelFromGrid(ref: any, dataToExport: any) {

    import('xlsx').then((XLSX) => {

        const worksheetData = dataToExport.map((item: any) => {
            const row = createExcelRow(ref, item);
            return row;
        });
        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

        const excelBuffer = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'array',
        });
        const dataBlob = new Blob([excelBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const fileName = `export-data.xlsx`;
        saveAs(dataBlob, fileName);
    });
}

export function objectToFormData(object: any): FormData {
    const formData = new FormData();

    for (const key in object) {
        if (object.hasOwnProperty(key)) {
            const value = object[key];
            if (value !== null && value !== undefined) {
                if (key == "File" || key == "Image" || key == "ImageSign") {
                    formData.append(key, value);

                } else {
                    formData.append(key, value.toString());
                }
            }
        }
    }

    return formData;
}

export function isString(variable: any): boolean {
    return typeof variable === 'string';
}
export function formatNumberWithThousandSeparator(value: any, isCurrencyFormatted = true) {
    const symbol = isCurrencyFormatted ? "ELP" : "";
    const toFixed = 0
    try {
        if (!value) {
            return `0 ${symbol}`;
        }
        value = value * Math.pow(10, toFixed);
        value = Number(value.toFixed(0));
        value = value / Math.pow(10, toFixed);
        if (toFixed) {
            value = Number(value).toFixed(toFixed) + "";
        }
        value = value.toString();
        const x = value.split(".");
        let x1 = x[0];

        let x2 = "";
        if (x.length > 1 && x[1]) {
            x2 = x[1];
            if (toFixed && x2.length > toFixed) {
                x2 = x2.substring(0, toFixed);
            }

            if (x2.length > 0) {
                let temp = "";
                let exist = false;
                for (let index = x2.length - 1; index >= 0; index--) {
                    const value = Number(x2[index]);
                    if (exist == false && value == 0) continue;
                    exist = true;
                    temp = value + temp;
                }
                x2 = temp;
            }
            if (x2) x2 = `.${x2}`;
        }
        const rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, "$1" + "," + "$2");
        }
        return `${x1 + x2} ${symbol}`;
    } catch (error) {
        return `0 ${symbol}`;
    }
}
export function findDifference(a: InputValue[], b: InputValue[]): InputValue[] {
    const bCodeSet = new Set(b.map(item => item.code));

    const result = a.filter(item => !bCodeSet.has(item.code));

    return result;
}
