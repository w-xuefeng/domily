import type { WithFuncType } from "../../reactive/type";
import type DomilyFragment from "../custom-elements/fragment";
import type DomilyRouterView from "../custom-elements/router-view";
import type DomilyRenderSchema from "../schema";

/**
 * ==================== about tag ====================
 */
export interface IExtraTagNameMap {
  text: Text;
  comment: Comment;
  fragment: DomilyFragment;
  "router-view": DomilyRouterView;
  "rich-text": HTMLElement;
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
  css?: WithFuncType<string | DOMilyCascadingStyleSheets>;
}

/**
 * ==================== about children ====================
 */

export type DOMilyChildDOM = HTMLElement | Node | string | null | undefined;
export type DOMilyChild =
  | IDomilyRenderOptions<any, any, any>
  | DomilyRenderSchema<any, any, any>
  | DOMilyMountableRender<any, any, any>
  | DOMilyCustomElementComponent<any, any, any>;

export type DOMilyChildren =
  | WithFuncType<DOMilyChild | DOMilyChildDOM>[]
  | undefined
  | null;

/**
 * ==================== about component ====================
 */
export interface IDomilyRenderOptions<
  CustomElementMap = {},
  K extends DOMilyTags<CustomElementMap> = DOMilyTags,
  ListData = any
> {
  /**
   * base info
   */
  tag: K;
  id?: WithFuncType<string>;
  className?: WithFuncType<string>;

  /**
   * style info
   */
  css?: WithFuncType<string | DOMilyCascadingStyleSheets>;
  style?: WithFuncType<string | Partial<CSSStyleDeclaration>>;

  /**
   * properties and attributes
   */
  props?: WithFuncType<DOMilyRenderOptionsPropsOrAttrs<CustomElementMap, K>>;
  attrs?: WithFuncType<DOMilyRenderOptionsPropsOrAttrs<CustomElementMap, K>>;

  /**
   * content and children
   */
  text?: WithFuncType<string | number>;
  html?: WithFuncType<string>;
  children?: DOMilyChildren;

  /**
   * eventListeners
   */
  on?: DOMilyEventListenerRecord<DOMilyEventKeys>;

  /**
   * display controller
   */
  domIf?: WithFuncType<boolean>;
  domShow?: WithFuncType<boolean>;

  /**
   * list-map
   */
  mapList?: {
    list: WithFuncType<Iterable<ListData>>;
    map: (data: ListData, index: number) => DOMilyChild | DOMilyChildDOM;
  };
  key?: WithFuncType<string | number>;

  /**
   * custom element
   */
  customElement?: IDomilyCustomElementOptions;

  /**
   * life cycle
   */
  beforeMount?: (dom: HTMLElement | Node | null) => void | Promise<unknown>;
  mounted?: (dom: HTMLElement | Node | null) => void;
  beforeUnmount?: (dom: HTMLElement | Node | null) => void | Promise<unknown>;
  unmounted?: () => void;
}

export interface DOMilyCustomElementComponent<
  CustomTagNameMap = {},
  K extends DOMilyTags<CustomTagNameMap> = DOMilyTags,
  ListData = any
> {
  name: string;
  customElementComponent:
    | IDomilyRenderOptions<CustomTagNameMap, K, ListData>
    | DomilyRenderSchema<CustomTagNameMap, K, ListData>
    | DOMilyMountableRender<CustomTagNameMap, K, ListData>;
}

/**
 * ==================== about mountable ====================
 */
export interface DOMilyMountableRender<
  CustomTagNameMap = {},
  K extends DOMilyTags<CustomTagNameMap> = DOMilyTags,
  ListData = any
> {
  schema: DomilyRenderSchema<CustomTagNameMap, K, ListData>;
  mount: (parent?: HTMLElement | Document | ShadowRoot | string) => void;
  unmount: () => void;
}

/**
 * ==================== about lifecycle ====================
 */

export interface ILifecycleItem {
  dom: HTMLElement | Node | null;
  beforeMount?: (dom: HTMLElement | Node | null) => void | Promise<unknown>;
  mounted?: (dom: HTMLElement | Node | null) => void;
  beforeUnmount?: (dom: HTMLElement | Node | null) => void | Promise<unknown>;
  unmounted?: () => void;
}
