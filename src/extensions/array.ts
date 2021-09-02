declare global {
  interface Array<T> {
    zip<S>(other: S[]): [T, S][];

    findMap<S>(
      callbackfn: (value: T, index: number, array: T[]) => S | null | undefined,
    ): S | undefined;
  }
}

Array.prototype.zip = function (other) {
  return Array.from({ length: Math.min(this.length, other.length) }, (_, i) => [
    this[i]!,
    other[i]!,
  ]);
};

Array.prototype.findMap = function (callbackfn) {
  return this.reduce(
    (acc, value, index, array) => acc ?? callbackfn(value, index, array),
    undefined,
  );
};

export {};
