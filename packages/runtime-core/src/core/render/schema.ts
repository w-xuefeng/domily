import type {
  DOMilyCascadingStyleSheets,
  DOMilyChild,
  DOMilyChildDOM,
  DOMilyChildren,
  DOMilyEventKeys,
  DOMilyEventListenerRecord,
  DOMilyRenderOptionsPropsOrAttrs,
  DOMilyTags,
  IDomilyCustomElementOptions,
  IDomilyRenderOptions,
  TDomilyRenderProperties,
} from "./type/types";
import {
  c,
  f,
  h,
  handleCSS,
  handleHiddenStyle,
  internalCreateElement,
  mountable,
  rv,
  txt,
} from "../../utils/dom";
import { merge } from "../../utils/obj";
import { isFunction } from "../../utils/is";
import { domilyChildToDOM } from "./shared/parse";
import DomilyFragment from "./custom-elements/fragment";
import DomilyRouterView from "./custom-elements/router-view";

export default class DomilyRenderSchema<
  CustomElementMap = {},
  K extends DOMilyTags<CustomElementMap> = DOMilyTags,
  ListData = any,
> implements IDomilyRenderOptions<CustomElementMap, K, ListData>
{
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
   * list-loop
   */
  mapList?: {
    list: ListData[];
    map: (data: ListData, index: number) => DOMilyChild | DOMilyChildDOM;
  };

  /**
   * custom element
   */
  customElement?: IDomilyCustomElementOptions = {
    enable: void 0,
    name: void 0,
    useShadowDOM: false,
    shadowDOMMode: "open",
  };

  eventsAbortController: Map<DOMilyEventKeys, AbortController> = new Map();

  static create<
    CustomElementMap = {},
    K extends DOMilyTags<CustomElementMap> = DOMilyTags,
    ListData = any,
  >(schema: IDomilyRenderOptions<CustomElementMap, K, ListData>) {
    return new DomilyRenderSchema<CustomElementMap, K, ListData>(schema);
  }

  constructor(schema: IDomilyRenderOptions<CustomElementMap, K>) {
    /**
     * base info
     */
    this.tag = schema.tag;
    this.id = schema.id;
    this.className = schema.className;

    /**
     * style info
     */
    this.css = schema.css;
    this.style = schema.style;

    /**
     * properties and attributes
     */
    this.props = schema.props;
    this.attrs = schema.attrs;

    /**
     * content and children
     */
    this.text = schema.text;
    this.html = schema.html;
    this.children = schema.children;

    /**
     * eventListeners
     */
    this.on = this.handleEvents(schema.on);

    /**
     * display controller
     */
    this.domIf = this.handleDIf(schema.domIf);
    this.domShow = this.handleDShow(schema.domShow);

    /**
     * list-loop
     */
    this.mapList = schema.mapList;

    /**
     * custom element
     */
    this.customElement = merge(this.customElement, schema.customElement);
  }

  handleEventsOption(
    originalOptions: AddEventListenerOptions | undefined,
    abortController: AbortController,
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
            abortController,
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
        .filter((e) => e.length),
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

  handleCustomElement(dom: HTMLElement | Node) {
    const { enable, name, useShadowDOM, shadowDOMMode } =
      this.customElement || {};
    if (!enable || !name) {
      return dom;
    }
    const CustomElementComponent = class extends HTMLElement {
      shadowRoot: ShadowRoot | null = null;
      child: HTMLElement | Node | null = null;
      constructor(child: HTMLElement | Node | null) {
        super();
        this.child = child;
        if (useShadowDOM) {
          this.shadowRoot = this.attachShadow({
            mode: shadowDOMMode || "open",
          });
        }
      }
      connectedCallback() {
        const container = this.shadowRoot ?? this;
        if (this.child) {
          container.appendChild(this.child);
        }
      }
    };
    const CEC = customElements.get(name);
    if (!CEC) {
      customElements.define(name, CustomElementComponent);
      return new CustomElementComponent(dom);
    }
    return new CEC(dom);
  }

  domAOPTask(dom: HTMLElement | Node) {
    return this.handleCustomElement(dom);
  }

  render(): HTMLElement | Node | null {
    /**
     * handle list-map
     */
    if (this.mapList) {
      const { list, map } = this.mapList;
      if (Array.isArray(list) && isFunction(map)) {
        for (let i = 0; i < list.length; i++) {
          const child = map.apply(list, [list[i], i]);
          if (!this.children) {
            this.children = [child];
          } else {
            this.children.push(child);
          }
        }
      }
    }

    /**
     * handle dom-if
     */
    if (typeof this.domIf === "function" && !this.domIf()) {
      return c("dom-if");
    }

    if (typeof this.domIf === "boolean" && !this.domIf) {
      return c("dom-if");
    }

    /**
     * handle dom-show
     */
    const hidden =
      typeof this.domShow === "function"
        ? !this.domShow()
        : typeof this.domShow === "boolean"
          ? !this.domShow
          : false;

    /**
     * Text Node
     */
    if (this.tag === "text") {
      return hidden ? txt("") : txt(String(this.text ?? ""));
    }

    /**
     * Comment Node
     */
    if (this.tag === "comment") {
      return c(String(this.text ?? "domily-comment"));
    }

    const css = handleCSS(this.css);
    const style = handleHiddenStyle(this.style, hidden);
    const children = (this.children
      ?.map((child) => domilyChildToDOM(child))
      .filter((e) => !!e) || []) as (HTMLElement | Node)[];

    if (css) {
      children.unshift(css);
    }

    const props = {
      ...this.props,
      ...(this.id ? { id: this.id } : {}),
      ...(this.className ? { className: this.className } : {}),
      ...(this.html
        ? { innerHTML: this.html }
        : this.text
          ? { innerText: this.text }
          : {}),
      attrs: this.attrs,
      style,
      on: this.on,
    } as unknown as TDomilyRenderProperties<CustomElementMap, K>;

    if ([DomilyFragment.name, "fragment"].includes(this.tag as string)) {
      return internalCreateElement(() => f(children), props);
    }

    if (this.tag === DomilyRouterView.name) {
      return internalCreateElement(() => rv(children), props);
    }

    return this.domAOPTask(
      h<CustomElementMap, K>(this.tag, props, children) as HTMLElement,
    );
  }
}

export function render<K extends DOMilyTags, ListData = any>(
  schema: IDomilyRenderOptions<{}, K, ListData>,
) {
  const domilySchema = DomilyRenderSchema.create<{}, K, ListData>(schema);
  const returnValue = mountable(
    {
      dom: domilySchema.render(),
      schema: domilySchema,
    },
    "dom",
  );
  return returnValue;
}

export function registerElement<ThisArgs extends object, T extends string>(
  thisArgs: ThisArgs,
  tag: T,
  constructor?: CustomElementConstructor | undefined,
) {
  if (constructor && !customElements.get(tag)) {
    customElements.define(tag, constructor);
  }
  Reflect.set(thisArgs, tag, (schema?: Record<string, any>) => {
    return render({ ...schema, tag } as any);
  });
  return thisArgs;
}
