import { signal, computed as _computed } from "alien-signals";

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

export function computed<T>(getter: (previousValue?: T) => T) {
  const nextGetter = _computed(getter);
  return {
    get value() {
      return nextGetter();
    },
  };
}

export function computedRender<T>(getter: (previousValue?: T) => T) {
  return _computed(getter);
}

export { computedRender as cr };
