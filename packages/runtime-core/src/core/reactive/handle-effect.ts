import { effect } from "alien-signals";
import { isFunction } from "../../utils/is";
import { deepClone } from "../../utils/obj";
import { WithFuncType } from "./type";

export function handleWithFunType<T>(option: WithFuncType<T>) {
  const value = isFunction(option) ? option() : option;
  return typeof value === "object" && value !== null ? deepClone(value) : value;
}

export function handleFunTypeEffect<T>(
  option: WithFuncType<T>,
  handleEffect?: (newValue: T) => void,
  handled?: boolean
) {
  if (handled) {
    return;
  }
  if (isFunction(handleEffect)) {
    effect(() => {
      handleEffect(handleWithFunType(option));
    });
  }
}

export function watchEffect<T>(
  option: WithFuncType<T>,
  handleEffect: (next: T, previous: T) => void,
  handled: boolean = false,
  isEqual: (next: T, previous: T) => boolean = (a, b) => Object.is(a, b),
  update: (next: T, previous: T) => T = (next, _previous) => next
) {
  const result = { value: void 0 as T };
  result.value = handleWithFunType(option);
  handleFunTypeEffect(
    option,
    (newValue) => {
      if (isEqual(newValue, result.value)) {
        return;
      }
      handleEffect(newValue, result.value);
      result.value = update(newValue, result.value);
    },
    handled
  );
  return result;
}
