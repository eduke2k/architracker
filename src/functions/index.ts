export function findKeyByValue<T extends Record<string, number>>(
  obj: T,
  value: T[keyof T],
): keyof T | undefined {
  return (Object.keys(obj) as (keyof T)[]).find((key) => obj[key] === value)
}

export function recordEntries<K extends PropertyKey, T>(object: Record<K, T>) {
  return Object.entries(object) as [K, T][]
}
