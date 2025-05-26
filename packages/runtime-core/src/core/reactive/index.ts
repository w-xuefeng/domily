import { signal, computed as _computed } from "alien-signals";
import { createOverload } from "../../utils/overload";
import { proxyObject } from "./utils";
import type { IComputed, Reactive, Ref } from "./type";

export { signal, effect } from "alien-signals";

export * from "./type";

export function ref<T>(value: T): Ref<T> {
  const signalValue = signal(value);
  Reflect.defineProperty(signalValue, "value", {
    get() {
      const rs = signalValue();
      return typeof rs === "object" && rs !== null
        ? proxyObject(rs, signalValue)
        : rs;
    },
    set(newValue: T) {
      signalValue(newValue);
    },
  });
  return signalValue as Ref<T>;
}

function normalComputed<T>(getter: (previousValue?: T) => T) {
  const nextGetter = _computed(getter);
  return {
    get value() {
      return nextGetter();
    },
  };
}
function withSetterComputed<T>(option: {
  get: (previousValue?: T) => T;
  set: (newValue: T) => void;
}) {
  const nextGetter = _computed(option.get);
  return {
    get value() {
      return nextGetter();
    },
    set value(newValue: T) {
      option.set(newValue);
    },
  };
}

const computed = createOverload<IComputed>();
computed.addImp("function", normalComputed as (params: Function) => any);
computed.addImp("object", withSetterComputed as (params: object) => any);

export function reactive<T extends object>(initialValue: T) {
  const value = signal<T>(initialValue);
  const setter = (newValue: Partial<T>) => {
    const nextValue = (
      Array.isArray(newValue)
        ? newValue
        : {
            ...value(),
            ...newValue,
          }
    ) as T;
    value(nextValue);
  };
  return new Proxy(value as Reactive<T>, {
    get(target, p, receiver) {
      const rs = Reflect.get(target(), p, receiver);
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

export function computedRender<T>(getter: (previousValue?: T) => T) {
  return _computed(getter);
}

export { computed, computedRender as cr };
