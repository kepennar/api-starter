import { Pagination } from "@agado/model";

export interface PaginationQuery {
  take: number;
  skip: number;
}
interface Metas {
  take: number;
  skip: number;
  count: number;
}
export function createPageInfo<T>(
  data: T[],
  { take, skip, count }: Metas
): Pagination.PageInfo {
  return {
    from: skip,
    to: skip + data.length,
    count,
    hasPrevious: skip >= take,
    hasNext: skip + take < count,
  };
}
