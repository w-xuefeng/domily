import { deepClone } from "../../utils/obj";

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
