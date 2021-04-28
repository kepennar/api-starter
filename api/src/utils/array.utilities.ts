import { ID } from "@agado/model";

export function sortFomIndexes<A extends { id: ID }>(indexes: ID[]) {
  return function (left: A, right: A) {
    const leftIndexInRequest = indexes.indexOf(left.id);
    const rightIndexInRequest = indexes.indexOf(right.id);
    if (leftIndexInRequest === rightIndexInRequest) {
      return 0;
    }
    if (leftIndexInRequest > rightIndexInRequest) {
      return -1;
    }
    return 1;
  };
}
