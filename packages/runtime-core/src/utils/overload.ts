export interface ITypeMap {
  string: string;
  number: number;
  bigint: bigint;
  boolean: boolean;
  symbol: symbol;
  undefined: undefined;
  object: object;
  function: Function;
}

export type GeType<T extends keyof ITypeMap> = ITypeMap[T];

export type ArrayType<T> = T extends [
  infer First extends keyof ITypeMap,
  ...infer Rest extends (keyof ITypeMap)[]
]
  ? [GeType<First>, ...ArrayType<Rest>]
  : T;

export type TOverload<T> = T & {
  addImp<P extends (keyof ITypeMap)[]>(
    ...args: [...paramTypes: P, (...params: ArrayType<P>) => any]
  ): void;
};

export function createOverload<T = Function>(): TOverload<T> {
  const implementsMap = new Map<string, Function>();

  const getKey = (args: any[], typeofKey = false) => {
    return (
      args.map((arg) => (typeofKey ? typeof arg : arg)).join("-") ||
      "[[none-args]]"
    );
  };

  function overload(...args: any[]) {
    const exe = implementsMap.get(getKey(args, true));
    if (typeof exe !== "function") {
      throw new TypeError("the function must have a implement at least");
    }
    return exe.apply(null, args);
  }

  function addImp<P extends (keyof ITypeMap)[]>(
    ...args: [...paramTypes: P, (...params: ArrayType<P>) => any]
  ) {
    const fn = args.pop();
    if (typeof fn !== "function") {
      throw new TypeError("the last args must be a function");
    }
    implementsMap.set(getKey(args), fn);
  }

  overload.addImp = addImp;
  return overload as TOverload<T>;
}
