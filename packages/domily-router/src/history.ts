import type { DomilyApp } from "@domily/runtime-core";
import DomilyRouterBase, { type ICreateRouterOptions } from "./base";

export default class DomilyHistoryRouter extends DomilyRouterBase {
  mode = "history" as const;
  constructor(app: DomilyApp, options?: ICreateRouterOptions) {
    super(app, options);
    Reflect.set(this.app.globalProperties, "$router", this);
    Reflect.defineProperty(this.app.globalProperties, "$route", {
      get: () => {
        return this.currentRoute;
      },
    });
  }
  initRouter() {}
}
