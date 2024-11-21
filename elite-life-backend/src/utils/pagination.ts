import { ResponseData } from './schemas/common.schema';

export const pagination = <T>(
  data: T[],
  total: number
): ResponseData<T[]> => {
  return {
    status: true,
    data,
    total
  };
};
