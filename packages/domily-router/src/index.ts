import { getCurrentInstance, type DomilyAppSchema } from '@domily/runtime-core';
import DomilyRouterBase, { type ICreateRouterOptions, type IRouterAfterEach, type IRouterBeforeEach } from './base';
import DomilyHashRouter from './hash';
import DomilyHistoryRouter from './history';

export * from './page';
export * from './event';
export { default as DomilyPageSchema } from './page';

export function createHistoryRouter(option?: ICreateRouterOptions) {
  const beforeEach: IRouterBeforeEach[] = [];
  const afterEach: IRouterAfterEach[] = [];
  return {
    install: (app: DomilyAppSchema) => {
      const router = new DomilyHistoryRouter(app, option);
      router.beforeEach = beforeEach;
      router.afterEach = afterEach;
    },
    beforeEach(callback: IRouterBeforeEach) {
      if (!beforeEach.includes(callback)) {
        beforeEach.push(callback);
      }
    },
    afterEach(callback: IRouterAfterEach) {
      if (!afterEach.includes(callback)) {
        afterEach.push(callback);
      }
    },
  };
}

export function createHashRouter(option?: ICreateRouterOptions) {
  const beforeEach: IRouterBeforeEach[] = [];
  const afterEach: IRouterAfterEach[] = [];
  return {
    install: (app: DomilyAppSchema) => {
      const router = new DomilyHashRouter(app, option);
      router.beforeEach = beforeEach;
      router.afterEach = afterEach;
    },
    beforeEach(callback: IRouterBeforeEach) {
      if (!beforeEach.includes(callback)) {
        beforeEach.push(callback);
      }
    },
    afterEach(callback: IRouterAfterEach) {
      if (!afterEach.includes(callback)) {
        afterEach.push(callback);
      }
    },
  };
}

export function useRouter(namespace?: string | symbol): {
  push: DomilyRouterBase['push'];
  replace: DomilyRouterBase['replace'];
  resolve: DomilyRouterBase['resolve'];
  back: DomilyRouterBase['back'];
  forward: DomilyRouterBase['forward'];
  go: DomilyRouterBase['go'];
  routes: DomilyRouterBase['routes'];
  currentRoute: DomilyRouterBase['currentRoute'];
} {
  const app = getCurrentInstance(namespace);
  if (!app) {
    throw new Error(`the useRouter must be used by a domily app`);
  }
  return app.globalProperties['$router'];
}

export function useRoute(namespace?: string | symbol): DomilyRouterBase['currentRoute'] {
  const app = getCurrentInstance(namespace);
  if (!app) {
    return;
  }
  return app.globalProperties['$route'];
}

export const DomilyRouter = {
  DomilyRouterBase,
  DomilyHashRouter,
  DomilyHistoryRouter,
  createHistoryRouter,
  createHashRouter,
  useRouter,
  useRoute,
};

export interface IRouterGlobalProperties {
  $router: DomilyRouterBase;
  $route: DomilyRouterBase['currentRoute'];
}

if (!Reflect.get(globalThis, 'DomilyRouter')) {
  Reflect.defineProperty(globalThis, 'DomilyRouter', {
    value: DomilyRouter,
  });
}
