export const unique = (() => {
  let cnt = 0;
  return () => cnt++;
})();

export const nonNull = <T>(x: T | null | undefined): x is T =>
  x !== null && x !== undefined;

// Extend Array methods
declare global {
  interface Array<T> {
    zip<S>(arr: S[]): [T, S][];
  }
}

Array.prototype.zip = function (arr) {
  return Array.from({ length: Math.min(this.length, arr.length) }, (_, i) => [
    this[i]!,
    arr[i]!,
  ]);
};
