import { Injectable, PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { FilterMatchModeEnums } from '../enums.utils';


export interface FilterPipeData {
  [property: string]: FilterPipeDataDetail | FilterPipeData
}

export interface FilterPipeDataDetail {
  value: any,
  matchMode: FilterMatchModeEnums
}

@Injectable()
export class ParseFilterPipe implements PipeTransform<any> {
  transform(value: any, metadata: ArgumentMetadata) {
    return JSON.parse(value);
  }
}