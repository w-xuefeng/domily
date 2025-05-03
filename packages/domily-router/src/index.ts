import type { DomilyAppSchema } from '@domily/runtime-core';
import DomilyRouterBase, { type ICreateRouterOptions, type IRouterBeforeEach } from './base';
import DomilyHashRouter from './hash';
import DomilyHistoryRouter from './history';

export * from './page';
export * from './event';
export { default as DomilyPageSchema } from './page';

export function createHistoryRouter(option?: ICreateRouterOptions) {
  const beforeEach: IRouterBeforeEach[] = [];
  return {
    install: (app: DomilyAppSchema) => {
      const router = new DomilyHistoryRouter(app, option);
      router.beforeEach = beforeEach;
    },
    beforeEach(callback: IRouterBeforeEach) {
      if (!beforeEach.includes(callback)) {
        beforeEach.push(callback);
      }
    },
  };
}

export function createHashRouter(option?: ICreateRouterOptions) {
  const beforeEach: IRouterBeforeEach[] = [];
  return {
    install: (app: DomilyAppSchema) => {
      const router = new DomilyHashRouter(app, option);
      router.beforeEach = beforeEach;
    },
    beforeEach(callback: IRouterBeforeEach) {
      if (!beforeEach.includes(callback)) {
        beforeEach.push(callback);
      }
    },
  };
}

export const DomilyRouter = {
  DomilyRouterBase,
  DomilyHashRouter,
  DomilyHistoryRouter,
  createHistoryRouter,
  createHashRouter,
};

if (!Reflect.get(globalThis, 'DomilyRouter')) {
  Reflect.defineProperty(globalThis, 'DomilyRouter', {
    value: DomilyRouter,
  });
}
