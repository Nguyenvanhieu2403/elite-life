import { TransformFnParams } from 'class-transformer/types/interfaces';
import { MaybeType } from '../types/maybe.type';

export const cleanDataTransformer = (
  params: TransformFnParams,
): MaybeType<null> => params.value == undefined || params.value.length == 0 ? null : params.value 
