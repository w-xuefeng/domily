import { DomilyAppSchema, DomilyRouterView, EB, ISUtils, type DOMilyMountableRender } from '@domily/runtime-core';
import { combinePaths, type IMatchedRoute, matchRoute } from './match';
import { ROUTER_EVENTS } from './event';
import DomilyPageSchema, { type IDomilyPageSchema } from './page';

const { EventBus, EVENTS } = EB;

export interface ICreateRouterOptions {
  base?: string;
  routes?: IDomilyPageSchema<any>[];
}

export interface IRouterOptions {
  name?: string;
  path?: string;
  query?: Record<string, string>;
  params?: Record<string, string>;
}

export interface IMatchedPage extends IMatchedRoute {
  comp: DOMilyMountableRender<any, any>;
}

export interface IRouterBeforeEach {
  (
    from: IMatchedPage | undefined,
    to: IMatchedRoute | undefined,
    next: (to?: IRouterOptions | IMatchedPage | IMatchedRoute | string) => void,
  ): void;
}

export default abstract class DomilyRouterBase {
  abstract mode: 'history' | 'hash';
  /**
   * init router for the specific router
   */
  abstract initRouter(): void;
  /**
   * the store for the global page router history
   */
  GLobalPageRouterHistoryStoreArray: IMatchedPage[] = [];
  /**
   * the queue for the global page rendering
   */
  GLobalPageRouterRenderingQueue: (() => Promise<any>)[] = [];
  /**
   * the rendering-loading for the global page rendering
   */
  GLobalPageRouterRendering = false;
  /**
   * if the initial has been completed
   */
  initialed = false;
  /**
   * the application root dom node
   */
  root: HTMLElement | Document | ShadowRoot | undefined | null = null;
  /**
   * the current route on the page
   */
  currentRoute?: IMatchedRoute;
  /**
   * the current domily application DomilyAppSchema
   */
  app: DomilyAppSchema;
  /**
   * the router page config
   */
  routes: DomilyPageSchema<any>[] = [];
  /**
   * the router 'path' map
   */
  get routesPathMap() {
    return Object.fromEntries(this.routes.map(e => [e.path, e]));
  }
  /**
   * the router 'path' flat map by 'children'
   */
  get routesPathFlatMap() {
    const result: Record<string, DomilyPageSchema<any> & { parent?: DomilyPageSchema<any> | null }> = {};
    const getChildRoutes = (routes: DomilyPageSchema<any>[], parent: DomilyPageSchema<any> | null = null) => {
      routes.forEach(e => {
        result[combinePaths(parent?.path, e.path)] = Object.assign(e, {
          parent,
        });
        if (e.children) {
          getChildRoutes(e.children, e);
        }
      });
    };
    getChildRoutes(this.routes);
    return result;
  }
  /**
   * the router 'name' map
   */
  get routesNameMap() {
    return Object.fromEntries(this.routes.map(e => [e.name || e.path, e]));
  }
  /**
   * the router 'name' flat map by 'children'
   */
  get routesNameFlatMap() {
    const result: Record<string, DomilyPageSchema<any> & { parent?: DomilyPageSchema<any> | null }> = {};
    const getChildRoutes = (routes: DomilyPageSchema<any>[], parent: DomilyPageSchema<any> | null = null) => {
      routes.forEach(e => {
        result[e.name || e.path] = Object.assign(e, {
          parent,
        });
        if (e.children) {
          getChildRoutes(e.children, e);
        }
      });
    };
    getChildRoutes(this.routes);
    return result;
  }
  /**
   * before matched the router callback
   */
  beforeEach: IRouterBeforeEach[] = [];

  constructor(app: DomilyAppSchema, options?: ICreateRouterOptions) {
    const { routes, base = '' } = options || {};
    this.app = app;
    this.routes =
      routes?.map(e => {
        e.path = combinePaths(base, e.path);
        return DomilyPageSchema.create(e);
      }) || [];
    this.currentRoute = this.match();
    this.init();
  }

  init() {
    if (this.initialed) {
      return;
    }
    /**
     * enqueue page-render-promise when page mounted
     */
    EventBus.on<IMatchedPage>(ROUTER_EVENTS.PAGE_MOUNTED, e => {
      this.GLobalPageRouterHistoryStoreArray.push(e);
    });
    this.initRouter();
    EventBus.on<HTMLElement | Document | ShadowRoot | undefined | null>(EVENTS.APP_MOUNTED, e => {
      this.root = e;
      this.matchPage();
    });

    this.initialed = true;
  }

  async executeQueueRender() {
    if (this.GLobalPageRouterRendering) {
      return;
    }
    this.GLobalPageRouterRendering = true;
    while (this.GLobalPageRouterRenderingQueue.length) {
      const promise = this.GLobalPageRouterRenderingQueue.shift();
      if (typeof promise === 'function') {
        await promise();
      }
    }
    this.GLobalPageRouterRendering = false;
  }

  async prepareRouterView(item: IMatchedRoute, routerViewHTMLElement: HTMLElement) {
    routerViewHTMLElement.childNodes.forEach(e => e.remove());
    routerViewHTMLElement.setAttribute('path', item.path);
    return await item.render(routerViewHTMLElement);
  }

  async deepRender(matched?: IMatchedRoute) {
    if (!this.root || !matched) {
      return;
    }
    const rootRouterView = this.root.querySelector<HTMLElement>(DomilyRouterView.name);
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
        lastResult = await this.prepareRouterView(parents[i]!, rootRouterView);
      } else if (lastResult?.dom && 'querySelector' in lastResult.dom) {
        const el = (lastResult.dom as HTMLElement).querySelector<HTMLElement>(DomilyRouterView.name);
        if (!el) {
          return;
        }
        lastResult = await this.prepareRouterView(parents[i]!, el);
      }
    }
  }

  match(pathname?: string) {
    pathname = pathname || this.mode === 'history' ? globalThis.location.pathname : globalThis.location.hash.slice(1);

    const matched = matchRoute(Object.values(this.routesPathFlatMap), pathname);
    if (!matched) {
      return this.routesPathMap['/*'];
    }
    return matched;
  }

  matchPage() {
    const renderPromise = () =>
      new Promise<void>(resolve => {
        const from = this.GLobalPageRouterHistoryStoreArray.at(-1);
        const matched = this.match();
        if (Array.isArray(this.beforeEach) && this.beforeEach.length) {
          for (const before of this.beforeEach) {
            if (ISUtils.isFunction(before)) {
              before(from, matched, to => {
                if (!to) {
                  this.currentRoute = matched;
                  return;
                }
                if (typeof to === 'object' && 'render' in to && ISUtils.isFunction(to.render)) {
                  this.currentRoute = to;
                  return;
                }
                if (typeof to === 'string') {
                  this.currentRoute = this.resolve({ path: to });
                  return;
                }
                this.currentRoute = this.resolve(to);
              });
            }
          }
        } else {
          this.currentRoute = matched;
        }
        from?.comp.unmount();
        this.deepRender(this.currentRoute).finally(resolve);
      });
    this.GLobalPageRouterRenderingQueue.push(renderPromise);
    this.executeQueueRender();
  }

  public resolve(options: IRouterOptions) {
    const { name, path, query, params } = options;
    const data = {
      query,
      params,
    };
    if (name) {
      const routes = this.routesNameFlatMap[name];
      return Object.assign(data, routes, {
        fullPath: '// TODO',
        href: '// TODO',
      });
    }
    if (path) {
      const routes = this.routesPathFlatMap[path];
      return Object.assign(data, routes, {
        fullPath: '// TODO',
        href: '// TODO',
      });
    }
    // TODO
    console.log('🚀 ~ DomilyRouter ~ resolve ~ options:', options);
  }
  public push(options: IRouterOptions) {
    // TODO
    console.log('🚀 ~ DomilyRouter ~ push ~ options:', options);
  }
  public back() {
    // TODO
  }
  public go(deep: number) {
    // TODO
    console.log('🚀 ~ DomilyRouter ~ go ~ deep:', deep);
  }
  public replace(options: IRouterOptions) {
    // TODO
    console.log('🚀 ~ DomilyRouter ~ replace ~ options:', options);
  }
}
