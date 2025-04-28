import { c, f, h, proxyDomilySchema, mountable } from "../../utils/dom";
import { merge } from "../../utils/obj";
import type {
  TDomilyRenderProperties,
  WithCustomElementTagNameMap,
} from "../types/tags";

export type DOMilyTags<CustomElementMap = {}> =
  keyof WithCustomElementTagNameMap<CustomElementMap>;

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

export interface DOMilyCascadingStyleSheets
  extends Record<string, Partial<CSSStyleDeclaration>> {
  [k: string]: Record<string, any>;
}

export type DOMilyRenderSchemaPropsOrAttrs<
  CustomElementMap,
  K extends DOMilyTags<CustomElementMap>
> = Partial<
  Record<keyof WithCustomElementTagNameMap<CustomElementMap>[K], any>
> &
  Record<string, any>;

export type DOMilyChildren =
  | (
      | DomilyRenderSchema<any, any>
      | IDomilyRenderSchema<any, any>
      | {
          schema: DomilyRenderSchema<any, any>;
          dom: HTMLElement | Node | string | null | undefined;
        }
      | {
          fragment: DocumentFragment;
          dom: (HTMLElement | Node | null)[];
          schema: DomilyRenderSchema<any, any>[];
        }
      | HTMLElement
      | Node
      | string
      | null
      | undefined
    )[]
  | undefined
  | null;

export interface IDomilyCustomElementOptions {
  enable?: boolean;
  name?: string;
  useShadowDOM?: boolean;
  shadowDOMMode?: "open" | "closed";
}

export interface IDomilyRenderSchema<
  CustomElementMap = {},
  K extends DOMilyTags<CustomElementMap> = DOMilyTags
> {
  tag: K;
  props?: DOMilyRenderSchemaPropsOrAttrs<CustomElementMap, K>;
  attrs?: DOMilyRenderSchemaPropsOrAttrs<CustomElementMap, K>;
  children?: DOMilyChildren;
  text?: string | number;
  html?: string;
  id?: string;
  css?: DOMilyCascadingStyleSheets;
  className?: string;
  style?: string | Partial<CSSStyleDeclaration>;
  events?: DOMilyEventListenerRecord<DOMilyEventKeys>;
  domIf?: boolean | (() => boolean);
  domShow?: boolean | (() => boolean);
  customElement?: IDomilyCustomElementOptions;
}

export interface DOMilyRenderReturnType<
  CustomTagNameMap,
  K extends DOMilyTags<CustomTagNameMap>
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

export interface DOMilyFragmentReturnType {
  dom: (HTMLElement | Node | null)[];
  fragment: DocumentFragment;
  schema: DomilyRenderSchema<any, any>[];
  mount: (parent?: HTMLElement | Document | ShadowRoot | string) => void;
  unmount: () => void;
}

export default class DomilyRenderSchema<
  CustomElementMap = {},
  K extends DOMilyTags<CustomElementMap> = DOMilyTags
> {
  tag: K;
  props?: DOMilyRenderSchemaPropsOrAttrs<CustomElementMap, K>;
  attrs?: DOMilyRenderSchemaPropsOrAttrs<CustomElementMap, K>;
  children?: DOMilyChildren;
  text?: string | number;
  html?: string;
  id?: string;
  css?: DOMilyCascadingStyleSheets;
  className?: string;
  style?: string | Partial<CSSStyleDeclaration>;
  events?: DOMilyEventListenerRecord<DOMilyEventKeys>;
  domIf?: boolean | (() => boolean);
  domShow?: boolean | (() => boolean);
  customElement?: IDomilyCustomElementOptions = {
    enable: false,
    useShadowDOM: false,
    shadowDOMMode: "open",
  };
  childrenSchema: DomilyRenderSchema<any, any>[] = [];
  eventsAbortController: Map<DOMilyEventKeys, AbortController> = new Map();
  parentElement: HTMLElement | null = null;
  nextSibling: Node | null = null;
  previousSibling: Node | null = null;

  static create<
    CustomElementMap = {},
    K extends DOMilyTags<CustomElementMap> = DOMilyTags
  >(schema: IDomilyRenderSchema<CustomElementMap, K>) {
    return new DomilyRenderSchema<CustomElementMap, K>(schema);
  }

  constructor(schema: IDomilyRenderSchema<CustomElementMap, K>) {
    this.tag = schema.tag;
    this.props = schema.props;
    this.attrs = schema.attrs;
    this.children = schema.children;
    this.text = schema.text;
    this.html = schema.html;
    this.id = schema.id;
    this.css = schema.css;
    this.className = schema.className;
    this.style = schema.style;
    this.events = this.handleEvents(schema.events);
    this.domIf = this.handleDIf(schema.domIf);
    this.domShow = this.handleDShow(schema.domShow);
    this.customElement = merge(this.customElement, schema.customElement);
  }

  handleEventsOption(
    originalOptions: AddEventListenerOptions | undefined,
    abortController: AbortController
  ) {
    if (originalOptions?.signal) {
      originalOptions.signal.addEventListener("abort", () => {
        abortController.abort();
      });
    }
    return {
      ...originalOptions,
      signal: abortController.signal,
    } as AddEventListenerOptions;
  }

  handleEvents(events?: DOMilyEventListenerRecord<DOMilyEventKeys>) {
    if (!events) {
      return void 0;
    }
    return Object.fromEntries(
      Object.keys(events)
        .map((key) => {
          const value = events[key as DOMilyEventKeys];
          const abortController = new AbortController();
          this.eventsAbortController.set(
            key as DOMilyEventKeys,
            abortController
          );
          if (typeof value === "function") {
            return [
              key,
              {
                event: value,
                option: {
                  signal: abortController.signal,
                },
              },
            ];
          }
          if (typeof value === "object" && value !== null) {
            if ("option" in value) {
              const option =
                typeof value.option === "boolean"
                  ? {
                      capture: value.option,
                      signal: abortController.signal,
                    }
                  : this.handleEventsOption(value.option, abortController);
              return [
                key,
                {
                  event: value.event,
                  option,
                },
              ];
            }
            return [
              key,
              {
                event: value,
                option: {
                  signal: abortController.signal,
                },
              },
            ];
          }
          return [];
        })
        .filter((e) => e.length)
    ) as DOMilyEventListenerRecord<DOMilyEventKeys>;
  }

  handleDIf(dIf?: boolean | (() => boolean)) {
    return () => {
      if (typeof dIf === "undefined") {
        return true;
      }
      if (typeof dIf === "function") {
        return dIf();
      }
      return dIf;
    };
  }

  handleDShow(show?: boolean | (() => boolean)) {
    return () => {
      if (typeof show === "undefined") {
        return true;
      }
      if (typeof show === "function") {
        return show();
      }
      return show;
    };
  }

  snapshotDOMPosition(dom: HTMLElement | Node) {
    this.parentElement = dom.parentElement;
    this.nextSibling = dom.nextSibling;
    this.previousSibling = dom.previousSibling;
  }

  handleDomLoadEvent(dom: HTMLElement | Node) {
    window.addEventListener("DOMContentLoaded", () => {
      this.snapshotDOMPosition(dom);
    });
    return dom;
  }

  handleCustomElement(dom: HTMLElement | Node) {
    const { enable, name, useShadowDOM, shadowDOMMode } =
      this.customElement || {};
    if (!enable || !name || customElements.get(name)) {
      return dom;
    }
    customElements.define(
      name,
      class extends HTMLElement {
        shadowRoot: ShadowRoot | null = null;
        constructor() {
          super();
          if (useShadowDOM) {
            this.shadowRoot = this.attachShadow({
              mode: shadowDOMMode || "open",
            });
          }
        }
        connectedCallback() {
          const container = this.shadowRoot ?? this;
          container.appendChild(dom);
        }
      }
    );
    return document.createElement(name);
  }

  domAOPTask(dom: HTMLElement | Node) {
    const next = this.handleDomLoadEvent(dom);
    return this.handleCustomElement(next);
  }

  handleCSS() {
    if (!this.css) {
      return;
    }
    const selectors = Object.keys(this.css);
    if (!selectors.length) {
      return;
    }

    function objectToCSS(properties: Record<string, any>) {
      let cssString = "";
      for (const [prop, value] of Object.entries(properties)) {
        if (typeof value === "string") {
          const cssProperty = prop.replace(/([A-Z])/g, "-$1").toLowerCase();
          cssString += `${cssProperty}: ${value};`;
        }
        if (typeof value === "object") {
          cssString += `${prop} {${objectToCSS(value)}}`;
        }
      }
      return cssString.trim();
    }

    function jsonToCSS(cssRecord: DOMilyCascadingStyleSheets): string {
      let cssString = "";
      for (const [selector, properties] of Object.entries(cssRecord)) {
        cssString += `${selector} {${objectToCSS(properties)}}`;
      }
      return cssString.trim();
    }
    return h("style", null, document.createTextNode(jsonToCSS(this.css)));
  }

  render(): HTMLElement | Node | null {
    if (typeof this.domIf === "function" && !this.domIf()) {
      return c("dom-if");
    }

    if (typeof this.domIf === "boolean" && !this.domIf) {
      return c("dom-if");
    }

    if (this.tag === "text") {
      return this.domAOPTask(document.createTextNode(String(this.text ?? "")));
    }

    if (this.tag === "comment") {
      return this.domAOPTask(c(String(this.text ?? "comment node")));
    }

    if (this.tag === "fragment" && this.children) {
      const children = (
        Array.isArray(this.children) ? this.children : [this.children]
      ).filter((e) => !!e) as Parameters<typeof fragment>[0];
      return this.domAOPTask(fragment(children).fragment);
    }

    const css = this.handleCSS();

    const hidden =
      typeof this.domShow === "function"
        ? !this.domShow()
        : typeof this.domShow === "boolean"
        ? !this.domShow
        : false;

    const children = (this.children
      ?.map((child) => {
        if (!child) {
          return null;
        }
        if (child instanceof HTMLElement || child instanceof Node) {
          return child;
        }
        if (typeof child === "string") {
          return document.createTextNode(child);
        }
        if (
          typeof child === "object" &&
          "schema" in child &&
          "dom" in child &&
          "fragment" in child &&
          child.fragment &&
          Array.isArray(child.dom) &&
          Array.isArray(child.schema)
        ) {
          child.schema.forEach((e) => this.childrenSchema.push(e));
          return child.fragment;
        }
        if (
          typeof child === "object" &&
          "schema" in child &&
          "dom" in child &&
          !Array.isArray(child.schema)
        ) {
          this.childrenSchema.push(child.schema);
          return child.dom;
        }
        const childDomilyRenderSchema = new DomilyRenderSchema<any, any>(
          child as IDomilyRenderSchema<any, any>
        );
        this.childrenSchema.push(childDomilyRenderSchema);
        return childDomilyRenderSchema.render();
      })
      .filter((e) => !!e) || []) as (HTMLElement | Node | string)[];

    if (css) {
      children.unshift(css);
    }

    return this.domAOPTask(
      h<CustomElementMap, K>(
        this.tag,
        {
          ...this.props,
          ...(this.id ? { id: this.id } : {}),
          ...(this.className ? { className: this.className } : {}),
          ...(this.html
            ? { innerHTML: this.html }
            : this.text
            ? { innerText: this.text }
            : {}),
          attrs: this.attrs,
          style: hidden
            ? typeof this.style === "string"
              ? `${this.style};display:none!important;`
              : { ...this.style, display: "none!important" }
            : this.style,
          on: this.events,
        } as unknown as TDomilyRenderProperties<CustomElementMap, K>,
        children
      ) as HTMLElement
    );
  }
}

export function render<K extends DOMilyTags>(
  schema: IDomilyRenderSchema<{}, K>
) {
  const domilySchema = DomilyRenderSchema.create<{}, K>(schema);
  const returnValue = mountable(
    {
      dom: domilySchema.render(),
      schema: domilySchema,
    },
    "dom"
  );
  returnValue.schema = proxyDomilySchema(domilySchema, returnValue);
  return returnValue;
}

export function fragment(
  children: (IDomilyRenderSchema<any, any> | DOMilyRenderReturnType<any, any>)[]
) {
  const domilyFragments = children.map((child) => {
    if (
      typeof child === "object" &&
      child &&
      "dom" in child &&
      "schema" in child &&
      typeof child.schema === "object"
    ) {
      return {
        schema: child.schema,
        dom: child.dom as HTMLElement | Node | null,
      };
    }
    if (child instanceof DomilyRenderSchema) {
      const node = {
        schema: child,
        dom: child.render(),
      };
      node.schema = proxyDomilySchema(child, node);
      return node;
    }
    const schema = DomilyRenderSchema.create(
      child as IDomilyRenderSchema<any, any>
    );
    const node = {
      schema,
      dom: schema.render(),
    };
    node.schema = proxyDomilySchema(schema, node);
    return node;
  });
  const dom = domilyFragments.map((e) => e.dom);
  const schema = domilyFragments.map((e) => e.schema);
  const returnValue = mountable(
    {
      fragment: f(dom),
      dom,
      schema,
    },
    "fragment"
  );
  return returnValue;
}
