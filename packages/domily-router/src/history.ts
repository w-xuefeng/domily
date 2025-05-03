import type { DomilyAppSchema } from '@domily/runtime-core';
import DomilyRouterBase, { type ICreateRouterOptions } from './base';

export default class DomilyHistoryRouter extends DomilyRouterBase {
  mode = 'history' as const;
  constructor(app: DomilyAppSchema, options?: ICreateRouterOptions) {
    super(app, options);
    Reflect.set(this.app.globalProperties, '$router', this);
  }
  initRouter() {}
}
