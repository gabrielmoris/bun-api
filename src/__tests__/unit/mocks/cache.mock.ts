import { mock } from 'bun:test';

export const cacheGetMock = mock((_: string) => null as string | null);
export const cacheSetMock = mock((_key: string, _ttlSec: number, _value: string) => {});
export const cacheDelMock = mock((..._keys: string[]) => {});
export const cacheDelPatternMock = mock((_pattern: string) => {});
export const clearOldEntriesMock = mock(() => {});

export const mockCacheRepository = () =>
  mock.module('../../../repositories/cacheRepository', () => ({
    cacheGet: cacheGetMock,
    cacheSet: cacheSetMock,
    cacheDel: cacheDelMock,
    cacheDelPattern: cacheDelPatternMock,
    clearOldEntries: clearOldEntriesMock,
  }));
