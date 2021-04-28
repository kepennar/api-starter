export type NullableFields<T> = {
  [P in keyof T]: T[P] | null;
};

export function removeNullFields<T>(obj: NullableFields<T>): T {
  return Object.entries(obj).reduce((aggr, [name, value]) => {
    if (value === null) return aggr;
    return { ...aggr, [name]: value };
  }, {} as T);
}

export function getUniqueByProp<T extends { [prop: string]: unknown }>(
  arr: T[],
  prop: string
): T[] {
  return arr.filter(
    (obj, i, arr) => arr.map((mapObj) => mapObj[prop]).indexOf(obj[prop]) === i
  );
}
