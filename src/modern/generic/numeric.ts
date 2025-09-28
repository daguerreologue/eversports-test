export const range = (begin: number, end: number): number[] =>
  Array.from({ length: end }, (_, i) => i + begin)