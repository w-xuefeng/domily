import { isFunction, isThenable } from "../../utils/is";
import { GLobalPageRouterStoreArray } from "../router/router";
import DomilyAppSchema, { DomilyAppInstances } from "./app";
import {
  type DOMilyComponent,
  type AsyncDOMilyComponentModule,
  parseComponent,
} from "./component";
import { type DOMilyRenderReturnType } from "./render";

export interface IDomilyPageSchema<PageMeta = {}> {
  el?: string | HTMLElement;
  name?: string;
  namespace?: string | symbol;
  path: string;
  alias?: string | string[];
  component?: DOMilyComponent | AsyncDOMilyComponentModule;
  redirect?: { name?: string; path?: string };
  meta?: PageMeta;
  children?: IDomilyPageSchema[];
}

export default class DomilyPageSchema<PageMeta = {}> {
  el?: string | HTMLElement;
  name?: string;
  namespace: string | symbol;
  app: DomilyAppSchema<any>;
  path: string;
  alias?: string | string[];
  component?: DOMilyComponent | AsyncDOMilyComponentModule;
  redirect?: { name?: string; path?: string };
  meta?: PageMeta;
  children?: DomilyPageSchema<unknown>[];
  private functionComponent: DOMilyComponent | null = null;
  private asyncComponentLoading = false;
  private dom: HTMLElement | Node | null = null;

  constructor(schema: IDomilyPageSchema<PageMeta>, app?: DomilyAppSchema<any>) {
    this.el = schema.el;
    this.name = schema.name;
    this.namespace = schema.namespace || Symbol("DomilyAppNamespace");
    this.app =
      app ||
      DomilyAppInstances.get(this.namespace) ||
      new DomilyAppSchema<any>({ namespace: this.namespace, routes: [schema] });
    this.path = `${this.app.basePath || ""}${schema.path}`;
    this.alias = schema.alias;
    this.component = schema.component;
    this.redirect = schema.redirect;
    this.meta = schema.meta as PageMeta;
    this.children = schema.children?.map(
      (e) => new DomilyPageSchema<unknown>(e, this.app)
    );
  }

  static create<PageMeta = {}>(
    schema: IDomilyPageSchema<PageMeta>,
    app?: DomilyAppSchema<any>
  ) {
    return new DomilyPageSchema(schema, app);
  }

  #toView(
    component: DOMilyComponent,
    el?: HTMLElement | Document | ShadowRoot | string
  ) {
    const comp = parseComponent(component);
    comp.mount(el || this.el || this.app.el);
    GLobalPageRouterStoreArray.push(
      Object.assign(this, {
        comp,
      })
    );
    return comp;
  }

  render(el?: HTMLElement | Document | ShadowRoot | string) {
    const { resolve, reject, promise } =
      Promise.withResolvers<DOMilyRenderReturnType<any, any> | null>();

    if (this.redirect) {
      const { path, name } = this.redirect;
      if (path) {
        resolve(this.app.routesPathFlatMap[path].render(el));
      } else if (name) {
        resolve(this.app.routesNameFlatMap[name].render(el));
      }
      return promise;
    }

    if (isThenable(this.component)) {
      this.asyncComponentLoading = true;
      this.component
        .then(({ default: comp }) => {
          this.functionComponent = comp;
        })
        .catch(reject)
        .finally(() => {
          this.asyncComponentLoading = false;
          if (isFunction(this.functionComponent)) {
            resolve(this.#toView(this.functionComponent, el));
          }
        });
    } else if (isFunction(this.component)) {
      this.functionComponent = this.component;
      resolve(this.#toView(this.functionComponent, el));
    } else {
      resolve(null);
    }
    return promise;
  }
}

export function page<PageMeta = {}>(
  schema: IDomilyPageSchema<PageMeta>,
  app?: DomilyAppSchema<any>
) {
  const pageInstance = DomilyPageSchema.create(schema, app);

  return {
    page: pageInstance,
    mount(parent?: HTMLElement | Document | ShadowRoot | string) {
      return pageInstance.render(parent);
    },
  };
}
