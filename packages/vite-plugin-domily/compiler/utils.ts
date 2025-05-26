export interface VitePluginDomilyOptions {
  customElement?: {
    enable?: boolean;
    prefix?: string;
  };
}

export function merge<T>(a: any, b: any): T {
  if (Object.is(a, b)) {
    return b;
  }
  if (
    typeof a === "object" &&
    typeof b === "object" &&
    a !== null &&
    b !== null
  ) {
    if (Array.isArray(a) && Array.isArray(b)) {
      return [...a, ...b] as T;
    }

    return Object.keys(a).reduce(
      (t, ck) => {
        t[ck] = merge(t[ck], merge(a[ck], b[ck]));
        return t;
      },
      { ...a, ...b }
    );
  }

  return b ?? a;
}
