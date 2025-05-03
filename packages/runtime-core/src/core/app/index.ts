import { DomilyAppSchemaDefault } from "../../config";
import { $el } from "../../utils/dom";
import { DOMilyChild, DOMilyMountableRender } from "../render";
import { domilyChildToDOMilyMountableRender } from "../render/shared/parse";

import { EventBus, EVENTS } from "../../utils/event-bus";
import { isFunction } from "../../utils/is";

export const DomilyAppInstances = new Map<string | symbol, DomilyAppSchema>();

export type TDomilyAppSchema<
  GlobalProperties extends Record<string, any> = Record<string, any>
> = {
  namespace: string | symbol;
  el?: string | HTMLElement;
  title?: string;
  globalProperties?: GlobalProperties;
  mode?: "SPA" | "MPA";
  app: DOMilyChild;
};

export default class DomilyAppSchema<
  GlobalProperties extends Record<string, any> = Record<string, any>
> {
  el: string | HTMLElement;
  namespace: string | symbol;
  title: string;
  mode: "SPA" | "MPA";
  globalProperties: GlobalProperties;
  app: () => DOMilyMountableRender<any, any> | null;

  constructor(schema: TDomilyAppSchema<GlobalProperties>) {
    this.namespace = schema.namespace;
    this.el = schema.el || DomilyAppSchemaDefault.el;
    this.title = schema.title || DomilyAppSchemaDefault.title;
    this.mode = schema.mode || DomilyAppSchemaDefault.mode;
    this.globalProperties = (schema.globalProperties || {}) as GlobalProperties;
    this.app = () => domilyChildToDOMilyMountableRender(schema.app);
    DomilyAppInstances.set(this.namespace, this);
  }

  static create<
    GlobalProperties extends Record<string, any> = Record<string, any>
  >(schema: TDomilyAppSchema<GlobalProperties>) {
    return new DomilyAppSchema(schema);
  }

  use<Options>(
    plugin: { install: (app: DomilyAppSchema<any>, options?: Options) => void },
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
  GlobalProperties extends Record<string, any> = Record<string, any>
>(schema: TDomilyAppSchema<GlobalProperties>) {
  const appInstance = DomilyAppSchema.create<GlobalProperties>(schema);
  const comp = appInstance.app();
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
