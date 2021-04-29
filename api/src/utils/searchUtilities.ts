interface LookupParam<QueryParams> {
  name: keyof QueryParams;
  isArray?: boolean;
  isBoolean?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validator?: (val: any) => boolean;
}

export function parseSearchQuery<QueryParams>(
  params: LookupParam<QueryParams>[],
  query?: string | null
): QueryParams | undefined {
  if (!query) {
    return undefined;
  }
  const searchParams = new URLSearchParams(query);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const queryParams: any = {};
  for (const param of params) {
    const validator = param.validator;

    if (param.isArray) {
      const paramValue = searchParams.getAll(`${param.name}`);

      queryParams[param.name] = validator
        ? paramValue.filter((val) => validator(val))
        : paramValue;
    } else if (param.isBoolean) {
      const val = searchParams.get(`${param.name}`);
      const boolVal = val === undefined ? undefined : val === "true";

      queryParams[param.name] = boolVal;
    } else {
      const val = searchParams.get(`${param.name}`);
      queryParams[param.name] = validator
        ? val && validator(val)
          ? val
          : undefined
        : val || undefined;
    }
  }
  return queryParams;
}

export function toDeletedClause(deleted: boolean | null | undefined) {
  return deleted !== undefined
    ? deleted === false
      ? { equals: null }
      : { not: null }
    : undefined;
}
