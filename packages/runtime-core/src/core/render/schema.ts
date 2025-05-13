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
  ILifecycleItem,
  TDomilyRenderProperties,
  WithFuncType,
} from "./type/types";
import {
  c,
  f,
  h,
  handleCSS,
  handleHiddenStyle,
  internalCreateElement,
  mountable,
  replaceDOM,
  rv,
  txt,
} from "../../utils/dom";
import { hasDiff, merge } from "../../utils/obj";
import { isFunction } from "../../utils/is";
import { domilyChildToDOM } from "./shared/parse";
import DomilyFragment from "./custom-elements/fragment";
import DomilyRouterView from "./custom-elements/router-view";
import { EventBus, EVENTS } from "../../utils/event-bus";
import {
  handleFunTypeEffect,
  handleWithFunType,
  watchEffect,
} from "../reactive/handle-effect";

export default class DomilyRenderSchema<
  CustomElementMap = {},
  K extends DOMilyTags<CustomElementMap> = DOMilyTags,
  ListData = any
> implements IDomilyRenderOptions<CustomElementMap, K, ListData>
{
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

  /**
   * for reactive update
   */
  __dom: HTMLElement | Node | null = null;

  /**
   * life cycle
   */
  mounted?: (dom: HTMLElement | Node | null) => void;
  unmounted?: () => void;
  private childLifeCycleQueue: ILifecycleItem[] = [];

  eventsAbortController: Map<DOMilyEventKeys, AbortController> = new Map();

  static create<
    CustomElementMap = {},
    K extends DOMilyTags<CustomElementMap> = DOMilyTags,
    ListData = any
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

    /**
     * life cycle
     */
    this.handleLifeCycle(schema);
  }

  handleLifeCycle(schema: IDomilyRenderOptions<CustomElementMap, K>) {
    this.mounted = (dom) => {
      if (schema.mounted && isFunction(schema.mounted)) {
        schema.mounted(dom);
      }
      this.childLifeCycleQueue.forEach((child) => {
        if (child.mounted && isFunction(child.mounted)) {
          child.mounted(child.dom);
        }
      });
    };

    this.unmounted = () => {
      this.childLifeCycleQueue.forEach((child) => {
        if (child.unmounted && isFunction(child.unmounted)) {
          child.unmounted();
        }
      });
      if (schema.unmounted && isFunction(schema.unmounted)) {
        schema.unmounted();
      }
    };
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

  domInterrupter(dom: HTMLElement | Node) {
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
    watchEffect(this.domIf, (nextDomIf) => {
      if (!nextDomIf) {
        this.__dom = replaceDOM(this.__dom, c("dom-if"));
      } else {
        this.domIf = true;
        this.__dom = replaceDOM(this.__dom, this.render());
      }
    });

    /**
     * handle dom-show
     */
    const previousDomShow = watchEffect(this.domShow, (nextDomShow) => {
      if (this.__dom && "style" in this.__dom) {
        this.__dom.style.cssText = handleHiddenStyle(
          this.__dom.style.cssText,
          !nextDomShow
        ) as string;
      }
    });

    /**
     * Text Node
     */
    if (this.tag === "text") {
      const previousText = watchEffect(this.text, (text) => {
        this.__dom = replaceDOM(
          this.__dom,
          txt(!previousDomShow.value ? void 0 : text)
        );
      });
      this.__dom = txt(!previousDomShow.value ? void 0 : previousText.value);
      return this.__dom;
    }

    /**
     * Comment Node
     */
    if (this.tag === "comment") {
      const previousText = watchEffect(this.text, (text) => {
        this.__dom = replaceDOM(
          this.__dom,
          c(!previousDomShow.value ? '"domily-comment-hidden"' : text)
        );
      });
      this.__dom = c(previousText.value ?? "domily-comment");
      return this.__dom;
    }

    let previousCSS = handleCSS(handleWithFunType(this.css));
    handleFunTypeEffect(this.css, (css) => {
      const nextStyle = handleCSS(css);
      if (
        previousCSS &&
        nextStyle &&
        previousCSS.innerText === nextStyle.innerText
      ) {
        return;
      }
      previousCSS = replaceDOM(
        previousCSS,
        nextStyle
      ) as HTMLStyleElement | null;
    });

    let previousStyle = handleHiddenStyle(
      handleWithFunType(this.style),
      !previousDomShow
    );
    handleFunTypeEffect(this.style, (style) => {
      const nextStyle = handleHiddenStyle(style, !previousDomShow);
      if (previousStyle === nextStyle) {
        return;
      }
      if (this.__dom && "style" in this.__dom) {
        this.__dom.style.cssText =
          typeof nextStyle === "string" ? nextStyle : "";
      }
      previousStyle = nextStyle;
    });

    const children = (this.children
      ?.map((child) => domilyChildToDOM(child, this.childLifeCycleQueue))
      .filter((e) => !!e) || []) as (HTMLElement | Node)[];

    if (previousCSS) {
      children.unshift(previousCSS);
    }

    const props = {
      ...(() => {
        let previousProps = handleWithFunType(this.props);
        handleFunTypeEffect(this.props, (nextProps) => {
          if (!hasDiff(previousProps, nextProps)) {
            return;
          }
          if (!this.__dom || !nextProps) {
            return;
          }
          Object.keys(nextProps).forEach((k) => {
            Reflect.set(this.__dom as HTMLElement, k, nextProps[k]);
          });
          previousProps = nextProps;
        });
        return previousProps;
      })(),
      ...(this.id
        ? {
            id: (() => {
              let previousId = handleWithFunType(this.id);
              handleFunTypeEffect(this.id, (id) => {
                if (id === previousId) {
                  return;
                }
                if (this.__dom) {
                  Reflect.set(this.__dom as HTMLElement, "id", id);
                }
                previousId = id;
              });
              return previousId;
            })(),
          }
        : {}),
      ...(this.className
        ? {
            className: (() => {
              let previousClassName = handleWithFunType(this.className);
              handleFunTypeEffect(this.className, (className) => {
                if (className === previousClassName) {
                  return;
                }
                if (this.__dom) {
                  Reflect.set(
                    this.__dom as HTMLElement,
                    "className",
                    className
                  );
                }
                previousClassName = className;
              });
              return previousClassName;
            })(),
          }
        : {}),
      ...(this.html
        ? {
            innerHTML: (() => {
              let previousHTML = handleWithFunType(this.html);
              handleFunTypeEffect(this.html, (html) => {
                if (html === previousHTML) {
                  return;
                }
                if (this.__dom) {
                  Reflect.set(this.__dom as HTMLElement, "innerHTML", html);
                }
                previousHTML = html;
              });
              return previousHTML;
            })(),
          }
        : this.text
        ? {
            innerText: (() => {
              let previousText = handleWithFunType(this.text);
              handleFunTypeEffect(this.text, (text) => {
                if (text === previousText) {
                  return;
                }
                if (this.__dom) {
                  Reflect.set(this.__dom as HTMLElement, "innerText", text);
                }
                previousText = text;
              });
              return previousText;
            })(),
          }
        : {}),
      attrs: (() => {
        let previousAttrs = handleWithFunType(this.attrs);
        handleFunTypeEffect(this.attrs, (nextAttrs) => {
          if (!hasDiff(previousAttrs, nextAttrs)) {
            return;
          }
          if (!this.__dom || !nextAttrs) {
            return;
          }
          Object.keys(nextAttrs).forEach((k) => {
            (this.__dom as HTMLElement).setAttribute(k, nextAttrs[k]);
          });
          previousAttrs = nextAttrs;
        });
        return previousAttrs;
      })(),
      style: previousStyle,
      on: this.on,
    } as unknown as TDomilyRenderProperties<CustomElementMap, K>;

    if ([DomilyFragment.name, "fragment"].includes(this.tag as string)) {
      this.__dom = this.domInterrupter(
        internalCreateElement(() => f(children), props)
      );
    } else if (this.tag === DomilyRouterView.name) {
      this.__dom = this.domInterrupter(
        internalCreateElement(() => rv(children), props)
      );
    } else {
      this.__dom = this.domInterrupter(
        h<CustomElementMap, K>(this.tag, props, children) as HTMLElement
      );
    }
    return this.__dom;
  }
}

export function render<K extends DOMilyTags, ListData = any>(
  schema: IDomilyRenderOptions<{}, K, ListData>
) {
  return mountable(DomilyRenderSchema.create(schema));
}

export function registerElement<ThisArgs extends object, T extends string>(
  thisArgs: ThisArgs,
  tag: T,
  constructor?: CustomElementConstructor | undefined
) {
  if (constructor && !customElements.get(tag)) {
    customElements.define(tag, constructor);
  }
  Reflect.set(thisArgs, tag, (schema?: Record<string, any>) => {
    return render({ ...schema, tag } as any);
  });
  return thisArgs;
}

if (!EventBus.has(EVENTS.__INTERNAL_UPDATE)) {
  EventBus.on(
    EVENTS.__INTERNAL_UPDATE,
    ({
      nextSchema,
      originalSchema,
    }: {
      nextSchema: DomilyRenderSchema<any, any, any>;
      originalSchema: DomilyRenderSchema<any, any, any>;
    }) => {
      originalSchema.__dom = replaceDOM(
        originalSchema.__dom,
        nextSchema.render()
      );
    }
  );
}
