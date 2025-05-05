import type { DomilyAppSchema } from '@domily/runtime-core';
import DomilyRouterBase, { type ICreateRouterOptions } from './base';

export default class DomilyHistoryRouter extends DomilyRouterBase {
  mode = 'history' as const;
  constructor(app: DomilyAppSchema, options?: ICreateRouterOptions) {
    super(app, options);
    Reflect.set(this.app.globalProperties, '$router', this);
    Reflect.defineProperty(this.app.globalProperties, '$route', {
      get: () => {
        return this.currentRoute;
      },
    });
  }
  initRouter() {}
  back() {
    if (this.GLobalPagePathHistoryStoreArrayCursor <= 0) {
      return;
    }
    this.go(-1);
  }
  forward() {
    if (this.GLobalPagePathHistoryStoreArrayCursor >= this.GLobalPagePathHistoryStoreArray.length - 1) {
      return;
    }
    this.go(1);
  }
  go(deep?: number) {
    if (!deep) {
      this.matchPage(void 0, true);
      return;
    }
    const index = this.GLobalPagePathHistoryStoreArrayCursor + deep;
    const next = this.GLobalPagePathHistoryStoreArray[index];
    if (!next) {
      return;
    }
    this.matchPage(next, true, {
      afterRendered: (rendered, matched) => {
        if (matched && rendered) {
          this.GLobalPagePathHistoryStoreArrayCursor = index;
          history.replaceState(this.obtainHistoryState(matched), '', next);
        }
      },
    });
  }
}
