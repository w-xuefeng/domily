import { signal, computed as _computed } from "alien-signals";
import { merge } from "../../utils/obj";
import { createOverload } from "../../utils/overload";

export { signal, effect } from "alien-signals";

export function ref<T>(value: T) {
  const getter = signal(value);
  return {
    get value() {
      return getter();
    },
    set value(newValue) {
      getter(newValue);
    },
  };
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
interface IComputed {
  <T>(getter: (previousValue?: T) => T): {
    readonly value: T;
  };
  <T>(option: { get: (previousValue?: T) => T; set: (newValue: T) => void }): {
    value: T;
  };
}
const computed = createOverload<IComputed>();
computed.addImp("function", normalComputed as (params: Function) => any);
computed.addImp("object", withSetterComputed as (params: object) => any);

export function reactive<T extends object>(initialValue: T) {
  const value = signal<T>(initialValue);
  const setter = (newValue: Partial<T>) => {
    const nextValue = merge<T>(value(), newValue);
    value(nextValue);
  };
  return new Proxy(value, {
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
