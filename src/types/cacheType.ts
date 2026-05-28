export type CacheOptions<T> = {
  key: string;
  ttlSec: number;
  loader: () => Promise<T>;
};
