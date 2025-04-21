import { h } from "../../utils/dom";

export type DOMilyTags = keyof HTMLElementTagNameMap | "text";
export type DOMilyChildren =
  | (
      | DomilyRenderSchema<any, any, any>
      | HTMLElement
      | Node
      | string
      | null
      | undefined
    )[]
  | undefined
  | null;

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

export type DOMilyRenderSchemaPropsOrAttrs<K> = Record<
  K extends keyof HTMLElementTagNameMap
    ? keyof HTMLElementTagNameMap[K] | string
    : string,
  any
>;

export default class DomilyRenderSchema<
  K extends DOMilyTags,
  C extends DOMilyChildren,
  EK extends DOMilyEventKeys
> {
  tag: K;
  props?: DOMilyRenderSchemaPropsOrAttrs<K>;
  attrs?: DOMilyRenderSchemaPropsOrAttrs<K>;
  children?: C;
  text?: string | number;
  html?: string;
  className?: string;
  style?: string | Record<string, any>;
  events?: DOMilyEventListenerRecord<EK>;
  domIf?: boolean | (() => boolean);
  domShow?: boolean | (() => boolean);
  eventsAbortController: Map<EK, AbortController> = new Map();

  static create<
    K extends DOMilyTags,
    C extends DOMilyChildren = undefined,
    EK extends DOMilyEventKeys = DOMilyEventKeys
  >(schema: Partial<DomilyRenderSchema<K, C, EK>> & { tag: K }) {
    return new DomilyRenderSchema<K, C, EK>(schema);
  }

  constructor(schema: Partial<DomilyRenderSchema<K, C, EK>> & { tag: K }) {
    this.tag = schema.tag;
    this.props = schema.props;
    this.attrs = schema.attrs;
    this.children = schema.children;
    this.text = schema.text;
    this.html = schema.html;
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
    if (!originalOptions?.signal) {
      return {
        ...originalOptions,
        signal: abortController.signal,
      } as AddEventListenerOptions;
    }
    originalOptions.signal.addEventListener("abort", () => {
      abortController.abort();
    });
    return originalOptions;
  }

  handleEvents(events?: DOMilyEventListenerRecord<EK>) {
    if (!events) {
      return void 0;
    }
    return Object.fromEntries(
      Object.keys(events)
        .map((key) => {
          const value = events[key as EK];
          const abortController = new AbortController();
          this.eventsAbortController.set(key as EK, abortController);
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
          return null;
        })
        .filter((e) => !!e)
    ) as DOMilyEventListenerRecord<EK>;
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

  render(): HTMLElement | Node | null {
    if (typeof this.domIf === "function" && !this.domIf()) {
      return null;
    }

    const hidden = typeof this.domShow === "function" ? !this.domShow() : false;

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
        return new DomilyRenderSchema(child).render();
      })
      .filter((e) => !!e) || []) as (HTMLElement | Node | string)[];
    if (this.tag === "text") {
      return document.createTextNode(String(this.text ?? ""));
    }
    return h(
      this.tag,
      {
        ...this.props,
        ...(this.html
          ? { innerHTML: this.html }
          : this.text
          ? { innerText: this.text }
          : {}),
        className: this.className,
        attrs: this.attrs,
        style: hidden
          ? typeof this.style === "string"
            ? `${this.style};display:none!important;`
            : { ...this.style, display: "none!important" }
          : this.style,
        on: this.events,
      },
      children
    );
  }
}
