import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache, Milliseconds } from 'cache-manager';
import { ApplicationTypeEnums } from 'src/utils/enums.utils';

@Injectable()
export class CacheService {
      constructor(
            @Inject(CACHE_MANAGER)
            private cacheManager: Cache,
      ) { }

      set = (applicationTypeEnums: ApplicationTypeEnums, key: string, value: unknown, ttl?: Milliseconds) =>
            this.cacheManager.set(`${applicationTypeEnums}${key}`, value, ttl);

      get = <T>(applicationTypeEnums: ApplicationTypeEnums, key: string) =>
            this.cacheManager.get<T>(`${applicationTypeEnums}${key}`);

      del = (applicationTypeEnums: ApplicationTypeEnums, key: string) =>
            this.cacheManager.del(`${applicationTypeEnums}${key}`);

      reset = () => this.cacheManager.reset();
}
