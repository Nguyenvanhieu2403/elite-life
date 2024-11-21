import { TransformFnParams } from 'class-transformer/types/interfaces';
import { MaybeType } from '../types/maybe.type';

export const stringToBooleanTransformer = (
  params: TransformFnParams
): MaybeType<boolean> => {
  return params.value == undefined || params.value.length == 0 ? null : params.value.toLowerCase().trim() == 'true'
}
