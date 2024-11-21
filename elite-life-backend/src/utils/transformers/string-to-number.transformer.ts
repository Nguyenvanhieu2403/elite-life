import { TransformFnParams } from 'class-transformer/types/interfaces';
import { MaybeType } from '../types/maybe.type';

export const stringToNumberTransformer = (
  params: TransformFnParams
): MaybeType<number> => {
  return params.value == undefined || params.value.length == 0 ? null : convertNumeric(params.value)
}

export function convertNumeric(value: any | string) {
  var isValid = /^[+-]?(\d+|)(\.\d+)?$/.test(value)
  if (isValid == false) return value
  return parseFloat(value)
}