import { c, h } from "../../utils/dom";
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
  className?: string;
  style?: string | Partial<CSSStyleDeclaration>;
  events?: DOMilyEventListenerRecord<DOMilyEventKeys>;
  domIf?: boolean | (() => boolean);
  domShow?: boolean | (() => boolean);
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
  className?: string;
  style?: string | Partial<CSSStyleDeclaration>;
  events?: DOMilyEventListenerRecord<DOMilyEventKeys>;
  domIf?: boolean | (() => boolean);
  domShow?: boolean | (() => boolean);
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
    this.className = schema.className;
    this.style = schema.style;
    this.events = this.handleEvents(schema.events);
    this.domIf = this.handleDIf(schema.domIf);
    this.domShow = this.handleDShow(schema.domShow);
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

  render(): HTMLElement | Node | null {
    if (typeof this.domIf === "function" && !this.domIf()) {
      return c("dom-if");
    }

    if (typeof this.domIf === "boolean" && !this.domIf) {
      return c("dom-if");
    }

    if (this.tag === "text") {
      return this.handleDomLoadEvent(
        document.createTextNode(String(this.text ?? ""))
      );
    }

    if (this.tag === "comment") {
      return this.handleDomLoadEvent(c(String(this.text ?? "comment node")));
    }

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

    return this.handleDomLoadEvent(
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
