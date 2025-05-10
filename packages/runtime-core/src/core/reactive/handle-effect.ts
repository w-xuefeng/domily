import { effect } from "alien-signals";
import { isFunction } from "../../utils/is";
import { WithFuncType } from "../render";

export function handleWithFunType<T>(option: WithFuncType<T>) {
  return isFunction(option) ? option() : option;
}

export function handleFunTypeEffect<T>(
  option: WithFuncType<T>,
  handleEffect?: (newValue: T) => void
) {
  if (isFunction(option) && isFunction(handleEffect)) {
    effect(() => {
      handleEffect(option());
    });
  }
}

export function watchEffect<T>(
  option: WithFuncType<T>,
  handleEffect: (next: T, previous: T) => void,
  isEqual: (next: T, previous: T) => boolean = (a, b) => Object.is(a, b),
  update: (next: T, previous: T) => T = (next, _previous) => next
) {
  const result = { value: void 0 as T };
  result.value = handleWithFunType(option);
  handleFunTypeEffect(option, (newValue) => {
    if (isEqual(newValue, result.value)) {
      return;
    }
    handleEffect(newValue, result.value);
    result.value = update(newValue, result.value);
  });
  return result;
}
