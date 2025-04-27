import { isFunction, isThenable } from "../../utils/is";
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
  component: DOMilyComponent | AsyncDOMilyComponentModule;
  meta?: PageMeta;
  children?: IDomilyPageSchema[];
}

export default class DomilyPageSchema<PageMeta = {}> {
  el?: string | HTMLElement;
  name?: string;
  namespace: string | symbol;
  app: DomilyAppSchema<any>;
  path: string;
  component: DOMilyComponent | AsyncDOMilyComponentModule;
  meta?: PageMeta;
  children?: DomilyPageSchema<unknown>[];
  private functionComponent: DOMilyComponent | null = null;
  private asyncComponentLoading = false;
  constructor(schema: IDomilyPageSchema<PageMeta>, app?: DomilyAppSchema<any>) {
    this.el = schema.el;
    this.name = schema.name;
    this.namespace = schema.namespace || Symbol("DomilyAppNamespace");
    this.app =
      app ||
      DomilyAppInstances.get(this.namespace) ||
      new DomilyAppSchema<any>({ namespace: this.namespace });
    this.path = `${this.app.basePath || ""}${schema.path}`;
    this.component = schema.component;
    this.meta = schema.meta as PageMeta;
    this.children = schema.children?.map(
      (e) => new DomilyPageSchema<unknown>(e)
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
    return comp;
  }

  render(el?: HTMLElement | Document | ShadowRoot | string) {
    const { resolve, reject, promise } =
      Promise.withResolvers<DOMilyRenderReturnType<any, any>>();
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
    } else {
      this.functionComponent = this.component;
      resolve(this.#toView(this.functionComponent, el));
    }
    return promise;
  }
}

export function page() {}
