import {
  CustomParamsToMap,
  OptionalWith,
  registerElement,
  render,
  type DOMilyMountableRender,
  type DOMilyTags,
  type IDomilyRenderOptions,
} from "./core/render";
import DomilyAppSchema, { app, type TDomilyAppSchema } from "./core/app";
import { HTMLNodeNameMap, SVGElementNameMap } from "./utils/tags";

export * as DOMUtils from "./utils/dom";
export * as EB from "./utils/event-bus";
export * as ISUtils from "./utils/is";
export * as OBJUtils from "./utils/obj";
export * as TAGSUtils from "./utils/tags";
export * from "./core/render";
export * from "./core/component";

export * from "./core/app";
export { default as DomilyAppSchema } from "./core/app";

export type DOMilyBase<CustomTagNameMap = {}> = {
  app<
    GlobalProperties extends Record<string, any> = Record<string, any>,
    AppProps extends Record<string, any> = Record<string, any>,
  >(
    schema: TDomilyAppSchema<GlobalProperties>,
    appProps?: AppProps,
  ): {
    app: DomilyAppSchema<GlobalProperties>;
    mount(
      parent?: HTMLElement | Document | ShadowRoot | string,
    ): (() => void) | null;
  };
  render: <K extends DOMilyTags<CustomTagNameMap>>(
    schema: IDomilyRenderOptions<CustomTagNameMap, K>,
  ) => DOMilyMountableRender<CustomTagNameMap, K>;
  registerElement<T extends string>(
    tag: T,
    constructor?: CustomElementConstructor | undefined,
  ): DOMily<
    typeof constructor extends new (...args: any) => infer R
      ? CustomTagNameMap & { [key in T]: R }
      : CustomTagNameMap
  >;
};

export type DOMily<CustomTagNameMap = {}> = {
  [T in DOMilyTags<CustomTagNameMap>]: (
    schema?: Omit<IDomilyRenderOptions<CustomTagNameMap, T>, "tag">,
  ) => DOMilyMountableRender<CustomTagNameMap, T>;
} & DOMilyBase<CustomTagNameMap>;

function builtinDomily() {
  const Domily = {
    app,
    render,
    registerElement<T extends string>(
      tag: T,
      constructor?: CustomElementConstructor | undefined,
    ) {
      return registerElement(Domily, tag, constructor);
    },
  };
  /**
   * register HTMLElementTagNameMap
   */
  Object.keys(HTMLNodeNameMap).forEach((tag) => {
    Domily.registerElement(tag);
  });
  /**
   * register SVGElementTagNameMap
   */
  Domily.registerElement(`svg`);
  Object.keys(SVGElementNameMap).forEach((tag) => {
    Domily.registerElement(`SVG:${tag}`);
  });
  /**
   * register RouterView
   */
  Domily.registerElement(`router-view`);
  /**
   * register fragment
   */
  Domily.registerElement(`fragment`);
  return Domily as unknown as DOMily;
}

function registerCustomElements<T extends DOMily, P extends string[] | object>(
  Domily: T,
  needRegisterCustomElements?: P,
) {
  if (!needRegisterCustomElements) {
    return Domily as OptionalWith<T, P, DOMily<CustomParamsToMap<P>>>;
  }
  if (
    Array.isArray(needRegisterCustomElements) &&
    needRegisterCustomElements.length
  ) {
    needRegisterCustomElements.forEach((tag) => {
      Domily.registerElement(tag);
    });
  } else if (
    typeof needRegisterCustomElements === "object" &&
    needRegisterCustomElements !== null
  ) {
    Object.keys(needRegisterCustomElements).forEach((tag) => {
      const value =
        needRegisterCustomElements[
          tag as keyof typeof needRegisterCustomElements
        ];
      if (!value) {
        Domily.registerElement(tag);
      } else if (typeof value === "function") {
        Domily.registerElement(tag, value as CustomElementConstructor);
      }
    });
  }
  return Domily as OptionalWith<T, P, DOMily<CustomParamsToMap<P>>>;
}

export function createDomily<T extends string[] | object = {}>(
  customElement?: T,
) {
  return registerCustomElements(builtinDomily(), customElement);
}

export const Domily = createDomily();
