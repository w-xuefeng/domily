import { DomilyAppSchemaDefault } from "../../config";
import { $el } from "../../utils/dom";
import { DOMilyChild, DOMilyMountableRender } from "../render";
import { domilyChildToDOMilyMountableRender } from "../render/shared/parse";

import { EventBus, EVENTS } from "../../utils/event-bus";
import { isFunction } from "../../utils/is";

export interface DOMilyObjectPlugin<Options = {}> extends Record<string, any> {
  install: (app: DomilyAppSchema<any, any>, options?: Options) => void;
}
export interface DOMilyFunctionPlugin<Options = {}> {
  (...args: any): any;
  install: (app: DomilyAppSchema<any, any>, options?: Options) => void;
}

export type DOMilyPlugin<T, Options = {}> =
  | (DOMilyObjectPlugin<Options> & T)
  | (DOMilyFunctionPlugin<Options> & T);

export type DOMilyAppParamsRender<AppProps> = (
  props?: AppProps
) => DOMilyChild | (() => DOMilyChild);

export type DOMilyAppRender<AppProps> = (
  props?: AppProps
) => DOMilyMountableRender<any, any> | null;

export const DomilyAppInstances = new Map<
  string | symbol,
  DomilyAppSchema<any, any>
>();

export type WithBaseProps<T = Record<string, any>> = T & {
  namespace: string | symbol;
};

export type TDomilyAppSchema<
  GlobalProperties extends Record<string, any> = Record<string, any>
> = {
  namespace?: string | symbol;
  el?: string | HTMLElement;
  title?: string;
  globalProperties?: GlobalProperties;
  mode?: "SPA" | "MPA";
};

export default class DomilyAppSchema<
  GlobalProperties extends Record<string, any> = Record<string, any>,
  AppProps extends Record<string, any> = Record<string, any>
> {
  el: string | HTMLElement;
  namespace: string | symbol;
  title: string;
  mode: "SPA" | "MPA";
  globalProperties: GlobalProperties;
  render: DOMilyAppRender<AppProps>;

  constructor(
    render: DOMilyAppParamsRender<AppProps>,
    schema?: TDomilyAppSchema<GlobalProperties>
  ) {
    this.namespace =
      schema?.namespace || Symbol(`domily-app-${DomilyAppInstances.size + 1}`);
    this.el = schema?.el || DomilyAppSchemaDefault.el;
    this.title = schema?.title || DomilyAppSchemaDefault.title;
    this.mode = schema?.mode || DomilyAppSchemaDefault.mode;
    this.globalProperties = (schema?.globalProperties ||
      {}) as GlobalProperties;
    this.render = (props) =>
      domilyChildToDOMilyMountableRender(
        render(
          Object.assign(
            {
              namespace: this.namespace,
            },
            props
          )
        )
      );
    DomilyAppInstances.set(this.namespace, this);
  }

  static create<
    GlobalProperties extends Record<string, any> = Record<string, any>,
    AppProps extends Record<string, any> = Record<string, any>
  >(
    render: DOMilyAppParamsRender<AppProps>,
    schema?: TDomilyAppSchema<GlobalProperties>
  ) {
    return new DomilyAppSchema(render, schema);
  }

  use<T, Options = {}>(plugin: DOMilyPlugin<T, Options>, options?: Options) {
    if (isFunction(plugin.install)) {
      plugin.install.apply(plugin, [this, options]);
    }
    return this;
  }

  destroy() {
    DomilyAppInstances.delete(this.namespace);
  }
}

export function createApp<
  GlobalProperties extends Record<string, any> = Record<string, any>,
  AppProps extends Record<string, any> = Record<string, any>
>(
  render: DOMilyAppParamsRender<AppProps>,
  schema?: TDomilyAppSchema<GlobalProperties>,
  appProps?: AppProps
) {
  const appInstance = DomilyAppSchema.create<GlobalProperties, AppProps>(
    render,
    schema
  );
  return {
    app: appInstance,
    mount(parent?: HTMLElement | Document | ShadowRoot | string) {
      const comp = appInstance.render(appProps);
      if (!comp) {
        return null;
      }
      comp.mount(parent || appInstance.el);
      EventBus.emit(
        EVENTS.APP_MOUNTED,
        $el<HTMLElement>(parent || appInstance.el)
      );
      return () => {
        comp.unmount();
      };
    },
  };
}

export function getCurrentInstance(
  namespace?: string | symbol
): undefined | DomilyAppSchema<any, any> {
  if (!namespace && DomilyAppInstances.size === 1) {
    return Array.from(DomilyAppInstances.values())[0];
  } else if (!namespace) {
    return;
  }
  return DomilyAppInstances.get(namespace);
}
