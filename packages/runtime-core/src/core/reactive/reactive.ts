import { signal } from "alien-signals";
import { INTERNAL_RAW_KEY, proxyObject, toRaw } from "./utils";
import type { Reactive } from "./type";

const INTERNAL_REACTIVE_KEY = Symbol("reactive");
const INTERNAL_REACTIVE_FLAG = "reactive";
const INTERNAL_SHALLOW_REACTIVE_FLAG = "shallowReactive";

export function isReactive<T extends object = any>(
  value: any
): value is Reactive<T> {
  const flag = value?.[INTERNAL_REACTIVE_KEY];
  return typeof value === "function" && Object.is(INTERNAL_REACTIVE_FLAG, flag);
}

export function isShallowReactive<T extends object = any>(
  value: any
): value is Reactive<T> {
  const flag = value?.[INTERNAL_REACTIVE_KEY];
  return (
    typeof value === "function" &&
    Object.is(INTERNAL_SHALLOW_REACTIVE_FLAG, flag)
  );
}

export default function reactive<T extends object>(initialValue: T) {
  if (isReactive<T>(initialValue)) {
    return initialValue;
  }
  initialValue = toRaw(initialValue) as T;

  const value = signal<T>(initialValue);
  const setter = (newValue: Partial<T>) => {
    /**
     * if newValue is an array, we assume it is a new value for the whole object
     * otherwise, we merge the newValue with the existing value
     * this allows us to update a single property or the whole object
     */
    const nextValue = (
      Array.isArray(newValue)
        ? newValue
        : {
            ...value(),
            ...newValue,
          }
    ) as T;
    value(nextValue);
    Reflect.set(value, INTERNAL_RAW_KEY, value());
  };

  Reflect.defineProperty(value, INTERNAL_REACTIVE_KEY, {
    configurable: false,
    writable: false,
    value: INTERNAL_REACTIVE_FLAG,
  });

  Reflect.defineProperty(value, INTERNAL_RAW_KEY, {
    value: initialValue,
  });

  return new Proxy(value as Reactive<T>, {
    get(target, p, receiver) {
      const rs = Reflect.get(target(), p, receiver);

      if (p === INTERNAL_RAW_KEY) {
        return rs;
      }

      return typeof rs === "object" && rs !== null
        ? proxyObject(rs, (data) => setter({ [p]: data } as Partial<T>))
        : rs;
    },
    set(_target, p, newValue) {
      setter({ [p]: newValue } as Partial<T>);
      return true;
    },
    deleteProperty(target, p) {
      const nextValue = { ...target() };
      Reflect.deleteProperty(nextValue, p);
      value(nextValue);
      return true;
    },
    defineProperty(target, p, attributes) {
      const nextValue = { ...target() };
      Reflect.defineProperty(nextValue, p, attributes);
      value(nextValue);
      return true;
    },
    apply(target, thisArg, argArray) {
      if (argArray.length === 0) {
        return Reflect.apply(target, thisArg, argArray);
      }
      setter(argArray[0]);
      return;
    },
  });
}

export function shallowReactive<T extends object>(initialValue: T) {
  if (isShallowReactive<T>(initialValue)) {
    return initialValue;
  }
  initialValue = toRaw(initialValue) as T;
  const value = signal<T>(initialValue);
  const setter = (newValue: Partial<T>) => {
    /**
     * if newValue is an array, we assume it is a new value for the whole object
     * otherwise, we merge the newValue with the existing value
     * this allows us to update a single property or the whole object
     */
    const nextValue = (
      Array.isArray(newValue)
        ? newValue
        : {
            ...value(),
            ...newValue,
          }
    ) as T;
    value(nextValue);
    Reflect.set(value, INTERNAL_RAW_KEY, value());
  };

  Reflect.defineProperty(value, INTERNAL_REACTIVE_KEY, {
    configurable: false,
    writable: false,
    value: INTERNAL_SHALLOW_REACTIVE_FLAG,
  });

  Reflect.defineProperty(value, INTERNAL_RAW_KEY, {
    value: initialValue,
  });

  return new Proxy(value as Reactive<T>, {
    get(target, p, receiver) {
      return Reflect.get(target(), p, receiver);
    },
    set(_target, p, newValue) {
      setter({ [p]: newValue } as Partial<T>);
      return true;
    },
    deleteProperty(target, p) {
      const nextValue = { ...target() };
      Reflect.deleteProperty(nextValue, p);
      value(nextValue);
      return true;
    },
    defineProperty(target, p, attributes) {
      const nextValue = { ...target() };
      Reflect.defineProperty(nextValue, p, attributes);
      value(nextValue);
      return true;
    },
    apply(target, thisArg, argArray) {
      if (argArray.length === 0) {
        return Reflect.apply(target, thisArg, argArray);
      }
      setter(argArray[0]);
      return;
    },
  });
}
