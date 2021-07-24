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
    splitAt(i: number): [T[], T[]];
  }
}

Array.prototype.zip = function (arr) {
  return Array.from({ length: Math.min(this.length, arr.length) }, (_, i) => [
    this[i]!,
    arr[i]!,
  ]);
};

Array.prototype.splitAt = function (i) {
  return [this.slice(0, i), this.slice(i)];
};
