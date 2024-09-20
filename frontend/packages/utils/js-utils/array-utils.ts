// combines arrays using a method tuned for performance when dealing with large arrays
export function combineArrays<T>(...arrays: T[][]): T[] {
  const combined: T[] = [];
  arrays.forEach(arr => combined.push(...arr));
  return combined;
}
