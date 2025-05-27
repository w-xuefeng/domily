import { computed as signalComputed } from "alien-signals";
import { createOverload } from "../../utils/overload";
import type { IComputed } from "./type";

function normalComputed<T>(getter: (previousValue?: T) => T) {
  const nextGetter = signalComputed(getter);
  Reflect.defineProperty(nextGetter, "value", {
    get() {
      return nextGetter();
    },
  });
  return nextGetter;
}
function withSetterComputed<T>(option: {
  get: (previousValue?: T) => T;
  set: (newValue: T) => void;
}) {
  const nextGetter = signalComputed(option.get);
  Reflect.defineProperty(nextGetter, "value", {
    get() {
      return nextGetter();
    },
    set(newValue) {
      option.set(newValue);
    },
  });
  return nextGetter;
}
const computed = createOverload<IComputed>();
computed.addImp("function", normalComputed as (params: Function) => any);
computed.addImp("object", withSetterComputed as (params: object) => any);

export { computed, signalComputed };
