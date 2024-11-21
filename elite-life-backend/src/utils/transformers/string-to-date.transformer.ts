import { TransformFnParams } from 'class-transformer/types/interfaces';
import { MaybeType } from '../types/maybe.type';
import * as  moment from 'moment';

export const stringToDateTransformer = (
  params: TransformFnParams,
  format: string = "DD/MM/YYYY"
): MaybeType<Date> => {
  return convertDate(params.value, format)
}

export function convertDate(value: any | string, format: string = "DD/MM/YYYY") {
  if (value == undefined) return null;
  var dateValid = moment(value, format)
  var isValid = dateValid.isValid();
  return isValid == false ? null : dateValid.toDate();
}
