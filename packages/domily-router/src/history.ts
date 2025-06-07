import type { DomilyApp } from "@domily/runtime-core";
import DomilyRouterBase, { type ICreateRouterOptions } from "./base";

export default class DomilyHistoryRouter extends DomilyRouterBase {
  constructor(app: DomilyApp, options?: Omit<ICreateRouterOptions, "mode">) {
    super(app, {
      ...options,
      mode: "history" as const,
    });
    Reflect.set(this.app.globalProperties, "$router", this);
    Reflect.defineProperty(this.app.globalProperties, "$route", {
      get: () => {
        return this.currentRoute;
      },
    });
  }
  initRouter() {}
}
