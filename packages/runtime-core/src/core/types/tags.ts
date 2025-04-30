import { DomilyFragment } from "../../utils/custom-element";
import { DomilyRouterView } from "../router/router";

export interface INodeNameMap {
  text: Text;
  comment: Comment;
  fragment: DomilyFragment;
  "router-view": DomilyRouterView;
}

export type TSvgElementNameMap = {
  [K in `SVG:${keyof SVGElementTagNameMap}`]: SVGElementTagNameMap[K extends `SVG:${infer R}`
    ? R
    : never];
} & {
  svg: SVGSVGElement;
};

export interface IElementTagNameMap
  extends HTMLElementTagNameMap,
    TSvgElementNameMap,
    INodeNameMap {}

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
