export const trimString = <T>(value: T): T =>
  typeof value === 'string' ? (value.trim() as unknown as T) : value;
