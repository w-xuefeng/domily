export type Thenable =
  | {
      then(): any;
    }
  | {
      (...args: any[]): any;
      then(): any;
    };

export const isObject = (val: any): val is object =>
  typeof val === "object" && val !== null;

export const isFunction = (val: any): val is Function =>
  typeof val === "function";

export const isThenable = (val: any): val is Thenable => {
  return (isObject(val) || isFunction(val)) && isFunction(val.then);
};

export const isES6Promise = (val: any): val is Promise<any> => {
  return isThenable(val) && val instanceof Promise;
};
