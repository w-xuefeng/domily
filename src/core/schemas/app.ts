import { DomilyAppSchemaDefault } from "../../config";
import { DomilyRouter } from "../router/router";
import DomilyPageSchema, { type IDomilyPageSchema } from "./page";

export const DomilyAppInstances = new Map<string | symbol, DomilyAppSchema>();

export type TDomilyAppSchema<
  GlobalProperties extends Record<string, any> = Record<string, any>
> = {
  namespace: string | symbol;
  el?: string | HTMLElement;
  title?: string;
  basePath?: string;
  globalProperties?: GlobalProperties;
  mode?: "SPA" | "MPA";
  routerMode?: "hash" | "history";
  routes?: IDomilyPageSchema<any>[];
};

export default class DomilyAppSchema<
  GlobalProperties extends Record<string, any> = Record<string, any>
> {
  el: string | HTMLElement;
  namespace: string | symbol;
  title: string;
  basePath: string;
  mode: "SPA" | "MPA";
  routerMode: "hash" | "history";
  globalProperties: GlobalProperties;
  routes: DomilyPageSchema<any>[] = [];
  router: DomilyRouter;

  constructor(schema: TDomilyAppSchema<GlobalProperties>) {
    this.namespace = schema.namespace;
    this.el = schema.el || DomilyAppSchemaDefault.el;
    this.title = schema.title || DomilyAppSchemaDefault.title;
    this.basePath = schema.basePath || "";
    this.mode = schema.mode || DomilyAppSchemaDefault.mode;
    this.routerMode = schema.routerMode || DomilyAppSchemaDefault.routerMode;
    this.globalProperties = (schema.globalProperties || {}) as GlobalProperties;
    this.routes =
      schema.routes?.map((e) => DomilyPageSchema.create(e, this)) || [];
    this.router = new DomilyRouter(this);
    DomilyAppInstances.set(this.namespace, this);
  }

  static create<
    GlobalProperties extends Record<string, any> = Record<string, any>
  >(schema: TDomilyAppSchema<GlobalProperties>) {
    return new DomilyAppSchema(schema);
  }

  use() {}

  get routesPathMap() {
    return Object.fromEntries(this.routes.map((e) => [e.path, e]));
  }
  get routesPathFlatMap() {
    const result: Record<string, DomilyPageSchema<any>> = {};
    const getChildRoutes = (routes: DomilyPageSchema<any>[]) => {
      routes.forEach((e) => {
        result[e.path] = e;
        if (e.children) {
          getChildRoutes(e.children);
        }
      });
    };
    getChildRoutes(this.routes);
    return result;
  }

  get routesNameMap() {
    return Object.fromEntries(this.routes.map((e) => [e.name || e.path, e]));
  }

  get routesNameFlatMap() {
    const result: Record<string, DomilyPageSchema<any>> = {};
    const getChildRoutes = (routes: DomilyPageSchema<any>[]) => {
      routes.forEach((e) => {
        result[e.name || e.path] = e;
        if (e.children) {
          getChildRoutes(e.children);
        }
      });
    };
    getChildRoutes(this.routes);
    return result;
  }

  destroy() {
    DomilyAppInstances.delete(this.namespace);
  }
}

export function app<
  GlobalProperties extends Record<string, any> = Record<string, any>
>(schema: TDomilyAppSchema<GlobalProperties>) {
  const appInstance = DomilyAppSchema.create<GlobalProperties>(schema);

  return {
    app: appInstance,
    mount(parent?: HTMLElement | Document | ShadowRoot | string) {
      const currentPage = appInstance.router.currentRoute;
      if (!currentPage) {
        return;
      }
      return currentPage.render(parent);
    },
  };
}
