export type SearchFilters = {
  query?: string;
  deleted?: boolean;
};

export type SearchParams = {
  filters?: SearchFilters;
  skip: number;
  take: number;
};
