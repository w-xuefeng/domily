import { signal } from "alien-signals";
import { proxyObject } from "./utils";
import type { Ref } from "./type";

export default function ref<T>(value: T): Ref<T> {
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

export function shallowRef<T>(value: T): Ref<T> {
  const signalValue = signal(value);
  Reflect.defineProperty(signalValue, "value", {
    get() {
      const rs = signalValue();
      return rs;
    },
    set(newValue: T) {
      signalValue(newValue);
    },
  });
  return signalValue as Ref<T>;
}
