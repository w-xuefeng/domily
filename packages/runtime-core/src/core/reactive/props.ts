type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

type Optional<T> = {
  [K in OptionalKeys<T>]-?: T[K];
};

export function withDefaultProps<T>(props: T, defaultValue: Optional<T>) {
  const keys = Reflect.ownKeys(defaultValue);
  for (const key of keys) {
    if (props[key as keyof T] === void 0) {
      props[key as keyof T] = defaultValue[key as OptionalKeys<T>];
    }
  }
  return props;
}
