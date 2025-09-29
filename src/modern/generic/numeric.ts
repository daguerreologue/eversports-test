export const range = (begin: number, end: number): number[] =>
  Array.from({ length: end - begin + 1 }, (_, i) => i + begin)