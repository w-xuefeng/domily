import {
  EB,
  ISUtils,
  parseComponent,
  type DOMilyComponent,
  type AsyncDOMilyComponentModule,
  type DOMilyMountableRender,
  DomilyAppInstances,
} from '@domily/runtime-core';
import { ROUTER_EVENTS } from './event';
import type { IMatchedPage } from './base';
const { isFunction, isThenable } = ISUtils;
const { EventBus } = EB;

export interface IDomilyPageSchema<PageMeta = {}> {
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
  name?: string;
  namespace: string | symbol;
  path: string;
  alias?: string | string[];
  component?: DOMilyComponent | AsyncDOMilyComponentModule;
  redirect?: { name?: string; path?: string };
  meta?: PageMeta;
  children?: DomilyPageSchema<unknown>[];
  private functionComponent: DOMilyComponent | null = null;
  private asyncComponentLoading = false;

  constructor(schema: IDomilyPageSchema<PageMeta>) {
    this.name = schema.name;
    this.namespace = schema.namespace || Symbol('DomilyAppNamespace');
    this.path = schema.path;
    this.alias = schema.alias;
    this.component = schema.component;
    this.redirect = schema.redirect;
    this.meta = schema.meta as PageMeta;
    this.children = schema.children?.map(e => {
      e.namespace = e.namespace ?? this.namespace;
      return new DomilyPageSchema<unknown>(e);
    });
  }

  static create<PageMeta = {}>(schema: IDomilyPageSchema<PageMeta>) {
    return new DomilyPageSchema(schema);
  }

  #toView(component: DOMilyComponent, el: HTMLElement | Document | ShadowRoot | string) {
    const comp = parseComponent(component, true);
    if (!comp) {
      return null;
    }
    comp.mount(el);
    EventBus.emit<IMatchedPage>(
      ROUTER_EVENTS.PAGE_MOUNTED,
      Object.assign(this, {
        comp,
      }),
    );
    return comp;
  }

  render(el: HTMLElement | Document | ShadowRoot | string) {
    const { resolve, reject, promise } = Promise.withResolvers<DOMilyMountableRender<any, any> | null>();

    if (this.redirect) {
      const app = DomilyAppInstances.get(this.namespace);
      if (!app || !app?.globalProperties?.$router) {
        resolve(null);
        return promise;
      }
      const router = app.globalProperties.$router;
      const { path, name } = this.redirect;
      if (path) {
        resolve(router.routesPathFlatMap[path]?.render(el) || null);
      } else if (name) {
        resolve(router.routesNameFlatMap[name]?.render(el) || null);
      } else {
        resolve(null);
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
          } else {
            resolve(null);
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

export function page<PageMeta = {}>(schema: IDomilyPageSchema<PageMeta>) {
  const pageInstance = DomilyPageSchema.create(schema);

  return {
    page: pageInstance,
    mount(parent: HTMLElement | Document | ShadowRoot | string) {
      return pageInstance.render(parent);
    },
  };
}
