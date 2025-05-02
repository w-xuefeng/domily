import DomilyFragment from "../custom-elements/fragment";
import type DomilyRenderSchema from "../schema";

/**
 * ==================== about tag ====================
 */
export interface IExtraTagNameMap {
  text: Text;
  comment: Comment;
  fragment: DomilyFragment;
}

export type TSvgElementTagNameMap = {
  [K in `SVG:${keyof SVGElementTagNameMap}`]: SVGElementTagNameMap[K extends `SVG:${infer R}`
    ? R
    : never];
} & {
  svg: SVGSVGElement;
};

export interface IElementTagNameMap
  extends HTMLElementTagNameMap,
    TSvgElementTagNameMap,
    IExtraTagNameMap {}

export type WithCustomElementTagNameMap<CustomTagNameMap = {}> =
  CustomTagNameMap extends Record<string, HTMLElement>
    ? IElementTagNameMap & CustomTagNameMap
    : IElementTagNameMap;

export type TDomilyRenderProperties<
  C,
  K extends keyof WithCustomElementTagNameMap<C>
> = Record<string, any> &
  Partial<Record<keyof WithCustomElementTagNameMap<C>[K], any>> & {
    attrs?: Record<string, string>;
    on?: Record<
      string | keyof HTMLElementEventMap,
      | EventListenerOrEventListenerObject
      | {
          event: EventListenerOrEventListenerObject;
          option?: boolean | AddEventListenerOptions;
        }
    >;
  };

export type TDomilyRenderSVGProperties<K extends keyof SVGElementTagNameMap> =
  Record<string, any> &
    Partial<Record<keyof SVGElementTagNameMap[K], any>> & {
      attrs?: Record<string, string>;
      on?: Record<
        string | keyof HTMLElementEventMap,
        | EventListenerOrEventListenerObject
        | {
            event: EventListenerOrEventListenerObject;
            option?: boolean | AddEventListenerOptions;
          }
      >;
    };

export type RecordConvertToHTMLElementMap<T extends Record<string, any>> = {
  [K in keyof T]: T[K] extends new (...args: any) => infer R ? R : HTMLElement;
};

export type ArrayConvertToHTMLElementMap<T extends readonly string[]> = {
  [K in T[number]]: HTMLElement;
};

export type OptionalWith<T, P, D> = P extends undefined
  ? T
  : P extends null
  ? T
  : D;

export type CustomParamsToMap<P> = P extends readonly string[]
  ? ArrayConvertToHTMLElementMap<P>
  : P extends Record<string, any>
  ? RecordConvertToHTMLElementMap<P>
  : never;

export type DOMilyTags<CustomElementMap = {}> =
  keyof WithCustomElementTagNameMap<CustomElementMap>;

/**
 * ==================== about event ====================
 */
export type DOMilyEventKeys = keyof HTMLElementEventMap | string;

export type DOMilyEventListenerRecord<T extends DOMilyEventKeys> = Record<
  T,
  | EventListenerOrEventListenerObject
  | ((e: Event | CustomEvent) => void)
  | {
      event:
        | EventListenerOrEventListenerObject
        | ((e: Event | CustomEvent) => void);
      option?: boolean | AddEventListenerOptions;
    }
>;

/**
 * ==================== about style ====================
 */
export interface DOMilyCascadingStyleSheets
  extends Record<string, Partial<CSSStyleDeclaration>> {
  [k: string]: Record<string, any>;
}

/**
 * ==================== about props and attrs ====================
 */
export type DOMilyRenderOptionsPropsOrAttrs<
  CustomElementMap,
  K extends DOMilyTags<CustomElementMap>
> = Partial<
  Record<keyof WithCustomElementTagNameMap<CustomElementMap>[K], any>
> &
  Record<string, any>;

export interface IDomilyCustomElementOptions {
  enable?: boolean;
  name?: string;
  useShadowDOM?: boolean;
  shadowDOMMode?: "open" | "closed";
}

/**
 * ==================== about children ====================
 */

export type DOMilyChildDOM = HTMLElement | Node | string | null | undefined;
export type DOMilyChild =
  | IDomilyRenderOptions<any, any>
  | DomilyRenderSchema<any, any>
  | DOMilyMountableRender<any, any>
  | DOMilyCustomElementComponent<any, any>;

export type DOMilyChildren =
  | (DOMilyChild | DOMilyChildDOM)[]
  | undefined
  | null;

/**
 * ==================== about component ====================
 */
export interface IDomilyRenderOptions<
  CustomElementMap = {},
  K extends DOMilyTags<CustomElementMap> = DOMilyTags
> {
  /**
   * base info
   */
  tag: K;
  id?: string;
  className?: string;

  /**
   * style info
   */
  css?: string | DOMilyCascadingStyleSheets;
  style?: string | Partial<CSSStyleDeclaration>;

  /**
   * properties and attributes
   */
  props?: DOMilyRenderOptionsPropsOrAttrs<CustomElementMap, K>;
  attrs?: DOMilyRenderOptionsPropsOrAttrs<CustomElementMap, K>;

  /**
   * content and children
   */
  text?: string | number;
  html?: string;
  children?: DOMilyChildren;

  /**
   * eventListeners
   */
  on?: DOMilyEventListenerRecord<DOMilyEventKeys>;

  /**
   * display controller
   */
  domIf?: boolean | (() => boolean);
  domShow?: boolean | (() => boolean);

  /**
   * custom element
   */
  customElement?: IDomilyCustomElementOptions;
}

export interface DOMilyCustomElementComponent<
  CustomTagNameMap = {},
  K extends DOMilyTags<CustomTagNameMap> = DOMilyTags
> {
  name: string;
  customElementComponent:
    | IDomilyRenderOptions<CustomTagNameMap, K>
    | DomilyRenderSchema<CustomTagNameMap, K>
    | DOMilyMountableRender<CustomTagNameMap, K>;
}

/**
 * ==================== about mountable ====================
 */
export interface DOMilyMountableRender<
  CustomTagNameMap = {},
  K extends DOMilyTags<CustomTagNameMap> = DOMilyTags
> {
  dom:
    | (K extends keyof WithCustomElementTagNameMap<CustomTagNameMap>
        ? WithCustomElementTagNameMap<CustomTagNameMap>[K]
        : HTMLElement | Node)
    | null;
  schema: DomilyRenderSchema<CustomTagNameMap, K>;
  mount: (parent?: HTMLElement | Document | ShadowRoot | string) => void;
  unmount: () => void;
}
