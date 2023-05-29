export function exclude<Data extends object, Key extends keyof Data>(
  data: Data,
  keys: Key[]
): Omit<Data, Key> {
  for (let key of keys) {
    delete data[key];
  }
  return data;
}
