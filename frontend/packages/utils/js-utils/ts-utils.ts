export const isStringArray = (value: unknown): value is string[] => {
  if (Array.isArray(value))
    return value.length > 0 && typeof value[0] === 'string';

  return false;
};

// Omit but preserves discriminated unions
export type DistributiveOmit<T, K extends keyof any> = T extends any
  ? Omit<T, K>
  : never;

export function chunk<T>(array: T[], size: number): T[][] {
  if (!array.length) {
    return [];
  }
  const head = array.slice(0, size);
  const tail = array.slice(size);
  return [head, ...chunk(tail, size)];
}

export const hasMessageProperty = (
  obj: unknown
): obj is { message: string } => {
  return (
    !!obj &&
    typeof obj === 'object' &&
    'message' in obj &&
    typeof obj.message === 'string'
  );
};

export type ReactSetState<T> = React.Dispatch<React.SetStateAction<T>>;

export type ReactState<T> = [T, ReactSetState<T>];

export type PromiseType<T extends Promise<unknown>> =
  T extends Promise<infer U> ? U : never;

export function isTruthy<T>(value: T | null | undefined): value is T {
  return Boolean(value);
}
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type UnionMap<T extends string> = {
  [K in T]: K;
};
