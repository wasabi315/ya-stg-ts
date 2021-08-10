declare global {
  interface Array<T> {
    zip<S>(other: S[]): [T, S][];

    findMap<S>(
      callbackfn: (value: T, index: number, array: T[]) => S | null | undefined,
      thisArg?: unknown,
    ): S | undefined;
  }
}

Array.prototype.zip = function (other) {
  return Array.from({ length: Math.min(this.length, other.length) }, (_, i) => [
    this[i]!,
    other[i]!,
  ]);
};

Array.prototype.findMap = function (callbackfn, thisArg) {
  return (
    this.map(callbackfn, thisArg).find(
      (value) => value !== null && typeof value !== "undefined",
    ) ?? undefined
  );
};

export {};
