import { deepClone } from "../../utils/obj";
import ref from "./ref";
import type { LiftFuncType, Reactive, Ref } from "./type";

export const INTERNAL_RAW_KEY = Symbol("raw");

const COLLECTION = {
  Map: Map,
  Set: Set,
  Array: Array,
};

const COLLECTION_METHODS = {
  Map: ["set", "delete", "clear"],
  Set: ["add", "delete", "clear"],
  Array: ["push", "pop", "shift", "unshift", "splice", "sort", "reverse"],
} as const;

function handleCollectionMethod(
  target: any,
  prop: string | symbol,
  value: Function,
  update: (value: any) => void,
  collection: keyof typeof COLLECTION,
  contractor: (typeof COLLECTION)[keyof typeof COLLECTION]
) {
  if (
    target instanceof contractor &&
    // @ts-ignore
    COLLECTION_METHODS[collection].includes(prop)
  ) {
    return function (...args: any[]) {
      const result = Reflect.apply(value, target, args);
      update(deepClone(target));
      return result;
    };
  }
}

export function proxyObject<T extends object>(
  original: T,
  update: (value: T) => void
): T {
  const handler: ProxyHandler<T> = {
    get(target, prop, receiver) {
      let _receiver = receiver;

      if (
        Object.keys(COLLECTION).some(
          (key) => target instanceof COLLECTION[key as keyof typeof COLLECTION]
        )
      ) {
        _receiver = original;
      }

      const value = Reflect.get(target, prop, _receiver);

      if (typeof value === "function") {
        return (
          Object.keys(COLLECTION)
            .map((key) =>
              handleCollectionMethod(
                target,
                prop,
                value,
                update,
                key as keyof typeof COLLECTION,
                COLLECTION[key as keyof typeof COLLECTION]
              )
            )
            .filter((e) => !!e)
            .at(0) ?? value.bind(target)
        );
      }
      if (typeof value === "object" && value !== null) {
        return proxyObject(value, (newVal) => {
          const clone = deepClone(target);
          clone[prop as keyof T] = newVal;
          update(clone);
        });
      }
      return value;
    },
    set(target, prop, newValue) {
      const result = Reflect.set(target, prop, newValue);
      update(deepClone(target));
      return result;
    },
  };

  return new Proxy(original, handler);
}

export function toRef<T extends object, K extends keyof T>(obj: T, key: K) {
  return ref(obj?.[key]) as Ref<LiftFuncType<T[K]>>;
}

export function toRefs<T extends object>(obj: T) {
  const result = {} as {
    [K in keyof T]: Ref<LiftFuncType<T[K]>>;
  };
  const keys = Reflect.ownKeys(obj);
  for (const key of keys) {
    result[key as keyof T] = toRef(obj, key as keyof T);
  }
  return result;
}

export function toRaw<T>(
  value: T
): T extends Ref<infer R> ? R : T extends Reactive<infer R> ? R : T {
  if (typeof value !== "function") {
    // @ts-ignore
    return value;
  }

  const raw =
    Reflect.get(value, INTERNAL_RAW_KEY) || value[INTERNAL_RAW_KEY as keyof T];

  if (raw !== void 0) {
    // @ts-ignore
    return raw;
  }

  // @ts-ignore
  return value;
}
