import { deepClone } from "../../utils/obj";

export function proxyObject<T extends object>(
  original: T,
  update: (value: T) => void
) {
  return new Proxy(original, {
    set(target, p, newValue, receiver) {
      const rs = Reflect.set(target, p, newValue, receiver);
      update(deepClone(target));
      return rs;
    },
  });
}
