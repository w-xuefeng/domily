import DomilyAppSchema, {
  app,
  type TDomilyAppSchema,
} from "./core/schemas/app";
import { page, type IDomilyPageSchema } from "./core/schemas/page";
import {
  type IDomilyRenderSchema,
  type DOMilyTags,
  type DOMilyRenderReturnType,
  type DOMilyFragmentReturnType,
  render,
  fragment,
} from "./core/schemas/render";
import type { OptionalWith, CustomParamsToMap } from "./core/types/tags";
import { HTMLNodeNameMap, SVGElementNameMap } from "./utils/tags";

export * as DOMUtils from "./utils/dom";
export * from "./core/schemas/render";

export type DOMilyBase<CustomTagNameMap = {}> = {
  app<GlobalProperties extends Record<string, any> = Record<string, any>>(
    schema: TDomilyAppSchema<GlobalProperties>
  ): {
    app: DomilyAppSchema<GlobalProperties>;
    mount(
      parent?: HTMLElement | Document | ShadowRoot | string
    ): Promise<DOMilyRenderReturnType<any, any>> | undefined;
  };
  page(schema: IDomilyPageSchema): any;
  render: <K extends DOMilyTags<CustomTagNameMap>>(
    schema: IDomilyRenderSchema<CustomTagNameMap, K>
  ) => DOMilyRenderReturnType<CustomTagNameMap, K>;
  fragment: (
    children: (
      | IDomilyRenderSchema<any, any>
      | DOMilyRenderReturnType<any, any>
    )[]
  ) => DOMilyFragmentReturnType;
  registerElement<T extends string>(
    tag: T,
    constructor?: CustomElementConstructor | undefined
  ): DOMily<
    typeof constructor extends new (...args: any) => infer R
      ? CustomTagNameMap & { [key in T]: R }
      : CustomTagNameMap
  >;
};

export type DOMily<CustomTagNameMap = {}> = {
  [T in DOMilyTags<CustomTagNameMap>]: (
    schema?: Omit<IDomilyRenderSchema<CustomTagNameMap, T>, "tag">
  ) => DOMilyRenderReturnType<CustomTagNameMap, T>;
} & DOMilyBase<CustomTagNameMap>;

function builtinDomily() {
  const Domily = {
    app,
    page,
    render,
    fragment,
    registerElement<T extends string>(
      tag: T,
      constructor?: CustomElementConstructor | undefined
    ) {
      if (constructor && !customElements.get(tag)) {
        customElements.define(tag, constructor);
      }
      Reflect.set(Domily, tag, (schema?: Record<string, any>) => {
        return Domily.render({ ...schema, tag } as any);
      });
      return Domily;
    },
  };
  Object.keys(HTMLNodeNameMap).forEach((tag) => {
    Domily.registerElement(tag);
  });
  Domily.registerElement(`svg`);
  Object.keys(SVGElementNameMap).forEach((tag) => {
    Domily.registerElement(`SVG:${tag}`);
  });
  return Domily as unknown as DOMily;
}

function registerCustomElements<T extends DOMily, P extends string[] | object>(
  Domily: T,
  needRegisterCustomElements?: P
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
  customElement?: T
) {
  return registerCustomElements(builtinDomily(), customElement);
}

export const Domily = createDomily();
