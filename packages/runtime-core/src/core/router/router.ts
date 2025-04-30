import DomilyAppSchema from "../schemas/app";
import type { DOMilyRenderReturnType } from "../schemas/render";
import { type IRouterConfig, type IMatchedRoute, matchRoute } from "./match";

let hashChangeEventListenerAdded = false;

export const GLobalPageRouterStoreArray: (IMatchedRoute & {
  comp: DOMilyRenderReturnType<any, any>;
})[] = [];

export interface IRouterOptions {
  name?: string;
  path?: string;
  query?: Record<string, string>;
  params?: Record<string, string>;
}

export class DomilyRouter {
  public routes: IRouterConfig[];
  public currentRoute: IMatchedRoute;
  public mode: "history" | "hash";
  private app: DomilyAppSchema;

  constructor(app: DomilyAppSchema) {
    this.app = app;
    this.routes = app.routes;
    this.mode = app.routerMode;
    this.prepareHashRoute();
    this.currentRoute = this.match();
  }

  prepareHashRoute() {
    if (this.mode === "hash") {
      if (!globalThis.location.hash) {
        globalThis.location.hash = "#/";
      }
      if (!hashChangeEventListenerAdded) {
        globalThis.addEventListener("hashchange", () => {
          GLobalPageRouterStoreArray.at(-1)?.comp.unmount();
          this.currentRoute = this.match();
          this.currentRoute?.render();
        });
        hashChangeEventListenerAdded = true;
      }
    }
  }

  match(pathname?: string) {
    pathname =
      pathname || this.mode === "history"
        ? globalThis.location.pathname
        : globalThis.location.hash.slice(1);

    const matched = matchRoute(this.routes, pathname);
    if (!matched) {
      return this.app.routesPathMap["/*"];
    }
    return matched;
  }

  public resolve(options: IRouterOptions) {
    console.log("🚀 ~ DomilyRouter ~ resolve ~ options:", options);
  }
  public push(options: IRouterOptions) {
    console.log("🚀 ~ DomilyRouter ~ push ~ options:", options);
  }
  public back() {}
  public go(deep: number) {
    console.log("🚀 ~ DomilyRouter ~ go ~ deep:", deep);
  }
  public replace(options: IRouterOptions) {
    console.log("🚀 ~ DomilyRouter ~ replace ~ options:", options);
  }
}

export class DomilyRouterView extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {}
  disconnectedCallback() {}
}
