export function merge<T>(a: any, b: any): T {
  if (
    typeof a === "object" &&
    typeof b === "object" &&
    a !== null &&
    b !== null
  ) {
    if (Array.isArray(a) && Array.isArray(b)) {
      return [...a, ...b] as T;
    }

    return Object.keys(a).reduce(
      (t, ck) => {
        t[ck] = merge(t[ck], merge(a[ck], b[ck]));
        return t;
      },
      { ...a, ...b }
    );
  }

  return b ?? a;
}

export function isSame(a: any[], b: any[]) {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (!Object.is(a[i], b[i])) {
      return false;
    }
  }
  return true;
}

export function singleton<T, D extends new (...args: any) => T>(className: D) {
  let instance: T;
  let params: any[] = [];
  return function (...args: any) {
    if (!instance) {
      instance = new className(...args);
      params = args;
      return instance;
    }
    if (isSame(params, args)) {
      return instance;
    } else {
      throw Error(`can not create instance from new ${className.name}`);
    }
  } as unknown as D;
}

export const hasDiff = (
  left: any,
  right: any,
  compare: (key: string, leftValue: any, rightValue: any) => boolean = (
    _k,
    _lv,
    _rv
  ) => true
): boolean => {
  if ((!left && right) || (left && !right)) {
    return true;
  }

  if (!left && !right) {
    return !Object.is(left, right);
  }

  const leftType = typeof left;
  const rightType = typeof right;
  const leftIsArray = Array.isArray(left);
  const rightIsArray = Array.isArray(right);

  if (leftType !== rightType) {
    return true;
  }

  if ((leftIsArray && !rightIsArray) || (!leftIsArray && rightIsArray)) {
    return true;
  }

  if (leftIsArray && rightIsArray) {
    if (left.length !== right.length) {
      return true;
    }
    return left.some((e, i) => hasDiff(e, right[i], compare));
  }

  if (leftType === "object") {
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    if (leftKeys.length !== rightKeys.length) {
      return true;
    }
    return Object.keys(left).some(
      (k) =>
        compare(k, left[k], right[k]) && hasDiff(left[k], right[k], compare)
    );
  }

  return !Object.is(left, right);
};
