import { DomilyAppSchemaDefault } from "../../config";
import { $el } from "../../utils/dom";
import { DOMilyChild, DOMilyMountableRender } from "../render";
import { domilyChildToDOMilyMountableRender } from "../render/shared/parse";

import { EventBus, EVENTS } from "../../utils/event-bus";
import { isFunction } from "../../utils/is";

const GLOBAL_APP_INSTANCE_KEY = "$DomilyAppInstances";

if (!Reflect.get(globalThis, GLOBAL_APP_INSTANCE_KEY)) {
  Reflect.set(
    globalThis,
    GLOBAL_APP_INSTANCE_KEY,
    new Map<string | symbol, DomilyAppSchema<any, any>>()
  );
}

export const DomilyAppInstances = Reflect.get(
  globalThis,
  GLOBAL_APP_INSTANCE_KEY
);

export type WithBaseProps<T = Record<string, any>> = T & {
  namespace: string | symbol;
};

export type TDomilyAppSchema<
  GlobalProperties extends Record<string, any> = Record<string, any>,
  AppProps extends Record<string, any> = Record<string, any>
> = {
  namespace: string | symbol;
  el?: string | HTMLElement;
  title?: string;
  globalProperties?: GlobalProperties;
  mode?: "SPA" | "MPA";
  app: (props?: AppProps) => DOMilyChild;
};

/**
 * domily global properties
 */
const GLOBAL_PROPERTY_KEY = "$P" as const;
if (!Reflect.get(globalThis, GLOBAL_PROPERTY_KEY)) {
  Reflect.set(globalThis, GLOBAL_PROPERTY_KEY, {});
}

export default class DomilyAppSchema<
  GlobalProperties extends Record<string, any> = Record<string, any>,
  AppProps extends Record<string, any> = Record<string, any>
> {
  el: string | HTMLElement;
  namespace: string | symbol;
  title: string;
  mode: "SPA" | "MPA";
  globalProperties: GlobalProperties;
  app: (props?: AppProps) => DOMilyMountableRender<any, any> | null;

  constructor(schema: TDomilyAppSchema<GlobalProperties>) {
    this.namespace = schema.namespace;
    this.el = schema.el || DomilyAppSchemaDefault.el;
    this.title = schema.title || DomilyAppSchemaDefault.title;
    this.mode = schema.mode || DomilyAppSchemaDefault.mode;
    this.globalProperties = (schema.globalProperties || {}) as GlobalProperties;
    this.app = (props) =>
      domilyChildToDOMilyMountableRender(
        schema.app(
          Object.assign(
            {
              namespace: this.namespace,
            },
            props
          )
        )
      );
    DomilyAppInstances.set(this.namespace, this);

    Reflect.set(
      globalThis[GLOBAL_PROPERTY_KEY as keyof typeof globalThis],
      this.namespace,
      new Proxy(this.globalProperties, {
        get: (target, p) => {
          return Reflect.get(target, p);
        },
        set: (target, p, newValue, receiver) => {
          return Reflect.set(target, p, newValue, receiver);
        },
      })
    );
  }

  static create<
    GlobalProperties extends Record<string, any> = Record<string, any>
  >(schema: TDomilyAppSchema<GlobalProperties>) {
    return new DomilyAppSchema(schema);
  }

  use<Options>(
    plugin: {
      install: (app: DomilyAppSchema<any, any>, options?: Options) => void;
    },
    options?: Options
  ) {
    if (isFunction(plugin.install)) {
      plugin.install.apply(plugin, [this, options]);
    }
    return this;
  }

  destroy() {
    DomilyAppInstances.delete(this.namespace);
  }
}

export function app<
  GlobalProperties extends Record<string, any> = Record<string, any>,
  AppProps extends Record<string, any> = Record<string, any>
>(schema: TDomilyAppSchema<GlobalProperties>, appProps?: AppProps) {
  const appInstance = DomilyAppSchema.create<GlobalProperties>(schema);
  const comp = appInstance.app(appProps);
  return {
    app: appInstance,
    mount(parent?: HTMLElement | Document | ShadowRoot | string) {
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

export function getCurrentInstance(namespace?: string | symbol) {
  if (!namespace && DomilyAppInstances.size === 1) {
    return Array.from(DomilyAppInstances.values())[0];
  } else if (!namespace) {
    return;
  }
  return DomilyAppInstances.get(namespace);
}
