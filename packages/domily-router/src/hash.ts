import type { DomilyApp } from "@domily/runtime-core";
import DomilyRouterBase, { type ICreateRouterOptions } from "./base";

export default class DomilyHashRouter extends DomilyRouterBase {
  constructor(app: DomilyApp, options?: Omit<ICreateRouterOptions, "mode">) {
    super(app, {
      ...options,
      mode: "hash" as const,
    });
    Reflect.set(this.app.globalProperties, "$router", this);
    Reflect.defineProperty(this.app.globalProperties, "$route", {
      get: () => {
        return this.currentRoute;
      },
    });
  }
  initRouter() {
    if (!globalThis.location.hash) {
      globalThis.location.hash = "#/";
    }
    globalThis.addEventListener("hashchange", () => {
      this.matchPage();
    });
  }
}
