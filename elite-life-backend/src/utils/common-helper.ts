
import * as  crypto from 'crypto';
import { FilterPipeData, FilterPipeDataDetail } from './transformers/pipe-filter.transformer';
import { FindOptions } from './types/find-options.type';
import { EntityCondition } from './types/entity-condition.type';
import { FilterMatchModeEnums } from './enums.utils';
import { Equal, ILike, In, LessThan, LessThanOrEqual, MoreThan, MoreThanOrEqual, Raw } from 'typeorm';
import { convertDate } from './transformers/string-to-date.transformer';
import { ComboData } from './schemas/common.schema';
import { instanceToPlain, plainToClass } from 'class-transformer';
import { ClassConstructor } from 'class-transformer/types/interfaces';
import * as moment from 'moment';

export function StringToMd5(text: string) {
    return crypto.createHash('md5').update('' + text).digest("hex")
}

export function ClassToClass<T, X>(desClass: T, distClass: ClassConstructor<X>): X {
    return plainToClass(distClass, desClass);;
}
export function ClassToClassNotValidate<T, X>(desClass: T, distClass: X): X {
    const desTransform = instanceToPlain(desClass);
    Object.keys(distClass).forEach(key => distClass[key] = desTransform[key]);
    return distClass;
}
export class GridFilterParse {
    static ParseWhere<T>(value: string) {
        let where: EntityCondition<T> = {}
        if (!isJsonString(value)) return where

        let filters: FilterPipeData = JSON.parse(value);
        let properties = Object.keys(filters);
        for (const property of properties) {
            let split = property.split(".");
            let filter: FilterPipeDataDetail | FilterPipeData
            filter = filters[property];

            if (filter && filter.matchMode) {
                if (filter.value != undefined || filter.value?.length > 0) {
                    let valueFilter: any;
                    switch (filter.matchMode) {
                        case FilterMatchModeEnums.Contains:
                            if (!filter.value) continue;
                            valueFilter = ILike(`%${filter.value}%`)
                            break;
                        case FilterMatchModeEnums.Equals:
                            valueFilter = Equal(filter.value)
                            break;
                        case FilterMatchModeEnums.Lt:
                            valueFilter = LessThan(filter.value)
                            break;
                        case FilterMatchModeEnums.Lte:
                            valueFilter = LessThanOrEqual(filter.value)
                            break;
                        case FilterMatchModeEnums.Gt:
                            valueFilter = MoreThan(filter.value)
                            break;
                        case FilterMatchModeEnums.Gte:
                            valueFilter = MoreThanOrEqual(filter.value)
                            break;
                        case FilterMatchModeEnums.DateIs:
                            let fromDateIs = convertDate(filter.value);
                            let toDateIs: Date | null = null;
                            if (fromDateIs) toDateIs = moment(fromDateIs).add(1, 'days').add(-1, 'millisecond').toDate()
                            valueFilter = Raw(alias => `${alias} >= :fromDateIs AND ${alias} <= :toDateIs`, { fromDateIs, toDateIs })
                            break;
                        case FilterMatchModeEnums.DateBefore:
                            valueFilter = LessThan(convertDate(filter.value))
                            break;
                        case FilterMatchModeEnums.DateAfter:
                            valueFilter = MoreThan(convertDate(filter.value))
                            break;
                        case FilterMatchModeEnums.In:
                            valueFilter = In(filter.value)
                            break;
                        default:
                            break;
                    }

                    if (split.length > 3) {
                        if (where[split[0]] == undefined) where[split[0]] = {}
                        if (where[split[0]][split[1]] == undefined) where[split[0]][split[1]] = {}
                        if (where[split[0]][split[1]][split[2]] == undefined) where[split[0]][split[1]][split[2]] = {}
                        where[split[0]][split[1]][split[2]][split[3]] = valueFilter
                    } else if (split.length > 2) {
                        if (where[split[0]] == undefined) where[split[0]] = {}
                        if (where[split[0]][split[1]] == undefined) where[split[0]][split[1]] = {}
                        where[split[0]][split[1]][split[2]] = valueFilter
                    } else if (split.length > 1) {
                        if (where[split[0]] == undefined) where[split[0]] = {}
                        where[split[0]][split[1]] = valueFilter
                    }
                    else
                        where[split[0]] = valueFilter

                }
            }
        }
        return where;
    }
}

export function isNumeric(value: any | string) {
    return /^[+-]?(\d+|)(\.\d+)?$/.test(value)
}

function isJsonString(str: string) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

export const PayPeriods: ComboData[] = [
    { Value: 3, Text: "3 đợt" },
    { Value: 2, Text: "2 đợt" },
    { Value: 1, Text: "1 đợt" }
]