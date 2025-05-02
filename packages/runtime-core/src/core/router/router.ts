import { DOMilyMountableRender } from "../render";
import DomilyAppSchema from "../schemas/app";

import { type IRouterConfig, type IMatchedRoute, matchRoute } from "./match";

let hashChangeEventListenerAdded = false;

export const GLobalPageRouterStoreArray: (IMatchedRoute & {
  comp: DOMilyMountableRender<any, any>;
})[] = [];

export const GLobalPageRouterRenderingQueue: (() => Promise<any>)[] = [];

let GLobalPageRouterRendering = false;

export const queueRender = async () => {
  if (GLobalPageRouterRendering) {
    return;
  }
  GLobalPageRouterRendering = true;
  while (GLobalPageRouterRenderingQueue.length) {
    const promise = GLobalPageRouterRenderingQueue.shift();
    if (typeof promise === "function") {
      await promise();
    }
  }
  GLobalPageRouterRendering = false;
};

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
  private root: HTMLElement | Document | ShadowRoot | undefined | null = null;

  constructor(app: DomilyAppSchema) {
    this.app = app;
    this.routes = app.routes;
    this.mode = app.routerMode;
    this.defineRouterView();
    this.prepareRoute();
    this.currentRoute = this.match();
  }

  setRoot(root: HTMLElement | Document | ShadowRoot | undefined | null) {
    this.root = root;
  }

  getRoot() {
    return this.root;
  }

  defineRouterView() {
    if (!customElements.get(DomilyRouterView.name)) {
      customElements.define(DomilyRouterView.name, DomilyRouterView);
    }
  }

  async prepareRouterView(
    item: IMatchedRoute,
    routerViewHTMLElement: HTMLElement
  ) {
    routerViewHTMLElement.childNodes.forEach((e) => e.remove());
    routerViewHTMLElement.setAttribute("path", item.path);
    return await item.render(routerViewHTMLElement);
  }

  async deepRender(matched?: IMatchedRoute) {
    if (!this.root || !matched) {
      return;
    }
    const rootRouterView = this.root.querySelector<HTMLElement>(
      DomilyRouterView.name
    );
    if (!rootRouterView) {
      return;
    }
    const parents: IMatchedRoute[] = [matched];
    const getParents = (matched: IMatchedRoute) => {
      if (matched.parent) {
        parents.unshift(matched.parent);
        getParents(matched.parent);
      }
    };
    getParents(matched);

    let lastResult: DOMilyMountableRender<any, any> | null = null;
    for (let i = 0; i < parents.length; i++) {
      if (i === 0) {
        lastResult = await this.prepareRouterView(parents[i], rootRouterView);
      } else if (lastResult?.dom && "querySelector" in lastResult.dom) {
        const el = (lastResult.dom as HTMLElement).querySelector<HTMLElement>(
          DomilyRouterView.name
        );
        if (!el) {
          return;
        }
        lastResult = await this.prepareRouterView(parents[i], el);
      }
    }
  }

  prepareRoute() {
    if (this.mode === "hash") {
      if (!globalThis.location.hash) {
        globalThis.location.hash = "#/";
      }
      if (!hashChangeEventListenerAdded) {
        globalThis.addEventListener("hashchange", async () => {
          this.matchPage();
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

    const matched = matchRoute(
      Object.values(this.app.routesPathFlatMap),
      pathname
    );
    if (!matched) {
      return this.app.routesPathMap["/*"];
    }
    return matched;
  }

  matchPage() {
    const renderPromise = () =>
      new Promise<void>((resolve) => {
        GLobalPageRouterStoreArray.at(-1)?.comp.unmount();
        this.currentRoute = this.match();
        console.log(
          "🚀 ~ DomilyRouter ~ matchPage ~ this.currentRoute:",
          this.currentRoute
        );
        this.deepRender(this.currentRoute).finally(resolve);
      });
    GLobalPageRouterRenderingQueue.push(renderPromise);
    queueRender();
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
  static name = "router-view";
  constructor() {
    super();
  }

  connectedCallback() {
    this.appendChild(document.createElement("slot"));
  }
  disconnectedCallback() {}
}
