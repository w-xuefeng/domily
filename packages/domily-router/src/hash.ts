import type { DomilyAppSchema } from '@domily/runtime-core';
import DomilyRouterBase, { type ICreateRouterOptions } from './base';

export default class DomilyHashRouter extends DomilyRouterBase {
  mode = 'hash' as const;

  constructor(app: DomilyAppSchema, options?: ICreateRouterOptions) {
    super(app, options);
    Reflect.set(this.app.globalProperties, '$router', this);
  }
  initRouter() {
    if (!globalThis.location.hash) {
      globalThis.location.hash = '#/';
    }
    globalThis.addEventListener('hashchange', () => {
      this.matchPage();
    });
  }
  back() {
    history.back();
  }
  forward() {
    history.forward();
  }
  go(deep: number) {
    history.go(deep);
  }
}
