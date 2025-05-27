export interface ISignalFunc<T> {
  (): T;
  (value: T): void;
}

export interface ISignalComputedFunc<T> {
  (): T;
}

export interface IReactiveFunc<T extends object> {
  (): T;
  (value: Partial<T>): void;
}

export type WithFuncType<T> = T | ((...args: any[]) => T) | ISignalFunc<T>;

export type WithFuncTypeProps<T> = {
  [K in keyof T]: WithFuncTypeProps<T[K]>;
};

export type Reactive<T extends object> = T & IReactiveFunc<T>;

export type Ref<T> = { value: T } & ISignalFunc<T>;

export type ReadonlyComputed<T> = {
  get value(): T;
} & ISignalComputedFunc<T>;

export type WriteableComputed<T> = {
  get value(): T;
  set value(newValue: T);
} & ISignalComputedFunc<T>;

export interface IComputed {
  <T>(getter: (previousValue?: T) => T): ReadonlyComputed<T>;
  <T>(option: {
    get: (previousValue?: T) => T;
    set: (newValue: T) => void;
  }): WriteableComputed<T>;
}
