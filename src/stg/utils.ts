export const unique = (() => {
  let cnt = 0;
  return () => cnt++;
})();
