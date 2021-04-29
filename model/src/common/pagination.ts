export type Search = {
  filters?: SearchFilters;
  skip: number;
  take: number;
  sort?: Sort;
};
export type SearchFilters = {
  query?: string;
  deleted?: boolean;
};

export type Sort = {
  name: string;
  order: SortOrder;
};
export type SortOrder = "asc" | "desc";

export type PageInfo = {
  from: number;
  to: number;
  count: number;
  hasPrevious: boolean;
  hasNext: boolean;
};
