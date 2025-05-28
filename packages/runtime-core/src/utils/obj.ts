export function merge<T>(a: any, b: any): T {
  if (Object.is(a, b) || !hasDiff(a, b)) {
    return b;
  }

  if (
    typeof a === "object" &&
    typeof b === "object" &&
    a !== null &&
    b !== null
  ) {
    if (Array.isArray(a) && Array.isArray(b)) {
      return [...a, ...b] as T;
    }

    return Reflect.ownKeys(a).reduce(
      (t, ck) => {
        t[ck] = merge(a[ck], b[ck]);
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
  /**
   * Someone may be a falsy value
   */
  if ((!left && right) || (left && !right)) {
    return true;
  }

  /**
   * Both are falsy value
   */
  if (!left && !right) {
    return !Object.is(left, right);
  }

  const leftType = typeof left;
  const rightType = typeof right;
  const leftIsArray = Array.isArray(left);
  const rightIsArray = Array.isArray(right);

  /**
   * The type is different
   */
  if (leftType !== rightType) {
    return true;
  }

  /**
   * The type is different
   * one of them is Array and another not be
   */
  if ((leftIsArray && !rightIsArray) || (!leftIsArray && rightIsArray)) {
    return true;
  }

  /**
   * Both are Array
   */
  if (leftIsArray && rightIsArray) {
    if (left.length !== right.length) {
      return true;
    }
    return left.some((e, i) => hasDiff(e, right[i], compare));
  }

  if (leftType === "object") {
    /**
     * The object type is different
     * one of them is iterable and another not be
     */
    if (
      (Symbol.iterator in left && !(Symbol.iterator in right)) ||
      (!(Symbol.iterator in left) && Symbol.iterator in right)
    ) {
      return true;
    }

    /**
     * Both are iterator
     */
    if (Symbol.iterator in left && Symbol.iterator in right) {
      const leftArray = [];
      const rightArray = [];
      for (const leftItem of left) {
        leftArray.push(leftItem);
      }
      for (const rightItem of right) {
        rightArray.push(rightItem);
      }
      return hasDiff(leftArray, rightArray, compare);
    }

    /**
     * The one of them is Date
     * compare the result of its getTime()
     */
    if (left instanceof Date) {
      return left.getTime() !== right.getTime?.();
    }

    /**
     * The one of them is RegExp
     * compare theirs source and flags
     */
    if (left instanceof RegExp) {
      return left.source !== right.source || left.flags !== right.flags;
    }

    const leftKeys = Reflect.ownKeys(left);
    const rightKeys = Reflect.ownKeys(right);
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

export function deepClone<T extends object>(value?: T) {
  const cached = new WeakMap();
  function _clone<V extends object>(value?: V): V {
    if (value === null || typeof value !== "object") {
      return value as unknown as V;
    }
    if (cached.has(value)) {
      return cached.get(value);
    }
    const _constructor = value.constructor;
    // @ts-ignore
    const res = new _constructor(_constructor === Object ? void 0 : value);
    cached.set(value, res);
    const keys = Reflect.ownKeys(value);
    for (const key of keys) {
      // @ts-ignore
      res[key] = _clone(value[key]);
    }
    return res;
  }
  return _clone(value);
}
