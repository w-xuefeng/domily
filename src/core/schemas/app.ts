import { DomilyAppSchemaDefault } from "../../config";
import DomilyPageSchema, { type IDomilyPageSchema } from "./page";

export const DomilyAppInstances = new Map<string | symbol, DomilyAppSchema>();

export interface IDomilySPASchema {
  mode?: "SPA";
  routes?: IDomilyPageSchema<any>[];
}

export interface IDomilyMPASchema {
  mode?: "MPA";
  pages?: IDomilyPageSchema<any>[];
}

export type TDomilyAppSchema<
  GlobalProperties extends Record<string, any> = Record<string, any>
> = {
  namespace: string | symbol;
  el?: string | HTMLElement;
  title?: string;
  basePath?: string;
  globalProperties?: GlobalProperties;
} & (IDomilySPASchema | IDomilyMPASchema);

export default class DomilyAppSchema<
  GlobalProperties extends Record<string, any> = Record<string, any>
> {
  el: string | HTMLElement;
  namespace: string | symbol;
  title: string;
  basePath: string;
  mode: "SPA" | "MPA";
  globalProperties: GlobalProperties;
  routes: DomilyPageSchema<any>[] = [];

  constructor(schema: TDomilyAppSchema<GlobalProperties>) {
    this.namespace = schema.namespace;
    this.el = schema.el || DomilyAppSchemaDefault.el;
    this.title = schema.title || DomilyAppSchemaDefault.title;
    this.basePath = schema.basePath || "";
    this.mode = schema.mode || DomilyAppSchemaDefault.mode;
    this.globalProperties = (schema.globalProperties || {}) as GlobalProperties;
    this.routes =
      schema.mode === "SPA"
        ? schema.routes?.map((e) => DomilyPageSchema.create(e, this)) || []
        : schema.mode === "MPA"
        ? schema.pages?.map((e) => DomilyPageSchema.create(e, this)) || []
        : [];
    DomilyAppInstances.set(this.namespace, this);
  }

  static create<
    GlobalProperties extends Record<string, any> = Record<string, any>
  >(schema: TDomilyAppSchema<GlobalProperties>) {
    return new DomilyAppSchema(schema);
  }

  use() {}

  match() {
    const { pathname } = location;
    const matched = this.routes.find((route) =>
      pathname.startsWith(route.path)
    );
    if (!matched) {
      return this.routes.find((route) => ["*"].includes(route.path));
    }
    return matched;
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
      const currentPage = appInstance.match();
      if (!currentPage) {
        return;
      }
      return currentPage.render(parent);
    },
  };
}
