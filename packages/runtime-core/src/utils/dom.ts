import DomilyRenderSchema from "../core/render/schema";
import type {
  WithCustomElementTagNameMap,
  TDomilyRenderProperties,
  TSvgElementTagNameMap,
  DOMilyChildren,
} from "../core/render/type/types";
import DomilyFragment from "../core/render/custom-elements/fragment";

export const noop = () => {};
export const svgNamespace = "http://www.w3.org/2000/svg" as const;

export function $<E extends Element = Element>(
  selector: string,
  container: HTMLElement | Document | ShadowRoot = document
) {
  return container.querySelector<E>(selector);
}

export function $$<E extends Element = Element>(
  selector: string,
  container: HTMLElement | Document | ShadowRoot = document
) {
  return Array.from(container.querySelectorAll<E>(selector));
}

export function $el<E extends Element = Element>(
  selector?: string | HTMLElement | Document | ShadowRoot,
  container: HTMLElement | Document = document
) {
  return typeof selector === "string"
    ? container.querySelector<E>(selector)
    : selector;
}

export function $item<E extends Element = Element>(
  [selector, i]: [q: string, i: number],
  container: HTMLElement | Document | ShadowRoot = document
) {
  return Array.from($<E>(selector, container)?.children || []).at(i);
}

export function $option<E extends Element = Element>(
  [selector, key, value]: [selector: string, key: keyof E, value: string],
  container: HTMLElement | Document | ShadowRoot = document
) {
  return $$<E>(selector, container).find((e) => e[key] === value);
}

export function $optionIncludes<E extends Element = Element>(
  [selector, key, value]: [selector: string, key: keyof E, value: string],
  container: HTMLElement | Document | ShadowRoot = document
) {
  return $$<E>(selector, container).find(
    (e) => `${e[key]}`.includes(value) || value.includes(e[key] as string)
  );
}

export function $dispatch(
  [selector, event]: [
    selector: string | HTMLElement,
    event: Event | CustomEvent
  ],
  container: HTMLElement | Document | ShadowRoot = document
) {
  return (
    typeof selector === "string" ? $(selector, container) : selector
  )?.dispatchEvent(event);
}

export function $dispatchEvent<K extends keyof WindowEventMap>(
  [selector, event]: [selector: string | HTMLElement, event: WindowEventMap[K]],
  container: HTMLElement | Document | ShadowRoot = document
) {
  return (
    typeof selector === "string" ? $(selector, container) : selector
  )?.dispatchEvent(event);
}

export function $children(
  parent: Element,
  filter: (element: Element, index: number, array: Element[]) => boolean = (
    e
  ) => !!e
) {
  const children = parent?.children;
  if (children) {
    return Array.from(children).filter(filter);
  }
  return [];
}

export function addCSS(
  cssText: string,
  styleId: string = `global-customer-css-${Date.now()}`,
  parent: ShadowRoot | Element | Document = document
) {
  const styleTag = document.createElement("style");
  styleTag.id = styleId;
  const content = document.createTextNode(cssText);
  styleTag.appendChild(content);
  if (parent === document) {
    parent.head.appendChild(styleTag);
  } else {
    parent.insertBefore(styleTag, parent.firstChild);
  }
  return styleTag;
}

export function removeCSS(
  styleIdOrDom: string | HTMLStyleElement,
  parent: ShadowRoot | Element | Document = document
) {
  if (typeof styleIdOrDom === "string") {
    const style = (parent === document ? parent.head : parent).querySelector(
      `#${styleIdOrDom}`
    );
    style?.remove();
  } else {
    styleIdOrDom?.remove?.();
  }
}

export function addClass(
  dom: string | HTMLElement,
  className: string | string[]
) {
  const classNames = Array.isArray(className) ? className : [className];
  const target = (
    typeof dom === "string" ? document.querySelector(dom) : dom
  ) as HTMLElement | null;
  if (!target) return;
  classNames.forEach((e) => {
    if (!target?.classList?.contains?.(e)) {
      target?.classList?.add?.(e);
    }
  });
}

export function removeClass(
  dom: string | HTMLElement,
  className: string | string[]
) {
  const classNames = Array.isArray(className) ? className : [className];
  const target = (
    typeof dom === "string" ? document.querySelector(dom) : dom
  ) as HTMLElement | null;
  if (!target) return;
  classNames.forEach((e) => {
    if (target?.classList?.contains?.(e)) {
      target.classList.remove(e);
    }
  });
}

export function toggleClass(
  dom: string | HTMLElement,
  className: string | string[]
) {
  const classNames = Array.isArray(className) ? className : [className];
  const target = (
    typeof dom === "string" ? document.querySelector(dom) : dom
  ) as HTMLElement | null;
  if (!target) return;
  classNames.forEach((e) => {
    if (target?.classList?.contains?.(e)) {
      target.classList.remove(e);
    } else {
      target?.classList?.add?.(e);
    }
  });
}

export function setCssVar(
  property: string,
  value: string | null,
  dom:
    | string
    | HTMLElement
    | (string | HTMLElement | undefined)[] = document.documentElement,
  priority?: string
) {
  if (!dom) {
    console.log(
      `[setCssVar ${property}: ${value} error] dom may not exist`,
      dom
    );
  }
  return (Array.isArray(dom) ? dom : [dom]).forEach((e) => {
    if (typeof e === "string") {
      document
        .querySelector<HTMLElement>(e)
        ?.style.setProperty(property, value, priority);
    } else {
      e?.style.setProperty(property, value, priority);
    }
  });
}

export function camelToKebab(str: string): string {
  return str
    .replace(/([A-Z])/g, "-$1")
    .toLowerCase()
    .replace(/^-/, "");
}

export function f(children: DOMilyChildren = []) {
  const F = customElements.get(DomilyFragment.name);
  if (!F) {
    customElements.define(DomilyFragment.name, DomilyFragment);
    return new DomilyFragment(children);
  }
  return new F(children);
}

export function c(data: string) {
  const comment = document.createComment(data);
  return comment;
}

export function txt(data: string) {
  const comment = document.createTextNode(data);
  return comment;
}

export function internalCreateElement<P>(
  creatorElement: (() => SVGElement) | (() => HTMLElement),
  properties?: P,
  children?:
    | (HTMLElement | Element | Node | string)[]
    | string
    | Element
    | HTMLElement
    | Node
) {
  const container = creatorElement();
  if (properties) {
    Object.entries(properties).forEach(([k, v]) => {
      if (k === "attrs" && typeof v === "object" && v !== null) {
        Object.entries(v as Record<string, string>).forEach(([ak, av]) => {
          container.setAttribute(ak, av);
        });
      } else if (k === "on" && typeof v === "object" && v !== null) {
        Object.entries(
          v as Record<
            string,
            | EventListenerOrEventListenerObject
            | {
                event: EventListenerOrEventListenerObject;
                option?: boolean | AddEventListenerOptions;
              }
          >
        ).forEach(([ek, ev]) => {
          const func =
            typeof ev === "function"
              ? ev.bind(container)
              : typeof ev === "object" &&
                ev !== null &&
                "event" in ev &&
                typeof ev.event === "function"
              ? ev.event.bind(container)
              : typeof ev === "object" &&
                ev !== null &&
                "handleEvent" in ev &&
                typeof ev.handleEvent === "function"
              ? ev.handleEvent.bind(container)
              : () => {};
          const option =
            typeof ev === "object" && ev !== null && "option" in ev
              ? ev.option
              : void 0;
          container.addEventListener(ek, func, option);
        });
      } else if (k === "style") {
        if (typeof v === "object" && v !== null) {
          const cssText = Object.entries(v)
            .map(([sk, sv]) => `${camelToKebab(sk)}:${sv}`)
            .join(";");
          Reflect.set(container.style, "cssText", cssText);
        } else if (typeof v === "string") {
          Reflect.set(container.style, "cssText", v);
        }
      } else if (k !== "attrs" && k !== "on" && k !== "style") {
        Reflect.set(container, k, v);
      }
    });
  }
  if (children) {
    container.append.apply(
      container,
      Array.isArray(children) ? children : [children]
    );
  }
  return container;
}

export function isSvgTag<K extends keyof WithCustomElementTagNameMap>(
  tagName: K
) {
  if (typeof tagName !== "string") {
    return false;
  }
  return tagName === "svg" || tagName.startsWith("SVG:");
}

export function h<
  CustomTagNameMap,
  K extends keyof WithCustomElementTagNameMap<CustomTagNameMap>
>(
  tagName: K,
  properties?: TDomilyRenderProperties<CustomTagNameMap, K> | null,
  children?: (HTMLElement | Node | string)[] | string | HTMLElement | Node
): WithCustomElementTagNameMap<CustomTagNameMap>[K];

export function h<
  K extends keyof (TSvgElementTagNameMap & HTMLElementTagNameMap)
>(
  tagName: K,
  properties?: TDomilyRenderProperties<
    TSvgElementTagNameMap & HTMLElementTagNameMap,
    K
  > | null,
  children?: (HTMLElement | Node | string)[] | string | HTMLElement | Node
) {
  if (typeof tagName !== "string") {
    return null;
  }
  const creator = isSvgTag(tagName)
    ? () => document.createElementNS(svgNamespace, tagName.replace(/^SVG:/, ""))
    : () => document.createElement(tagName);
  return internalCreateElement(creator, properties, children);
}

export function domMountToParent(
  dom: HTMLElement | Node | null,
  parent: HTMLElement | Document | ShadowRoot | string = document.body
) {
  if (!dom) {
    return noop;
  }
  const container =
    typeof parent === "string"
      ? document.querySelector<HTMLElement>(parent)
      : parent;
  if (!container) {
    return noop;
  }
  container.append(dom);
  return () => {
    if (dom) {
      removeDOM(dom);
    }
    dom = null;
  };
}

export function proxyDomilySchema(
  domilySchema: DomilyRenderSchema<any, any>,
  targetObject: { dom: HTMLElement | Node | null }
) {
  const proxyKeys = [
    "props",
    "attrs",
    "text",
    "html",
    "id",
    "className",
    "style",
    "domIf",
    "domShow",
  ];
  const domilySchemaProxy = new Proxy(domilySchema, {
    set(target, p, newValue, receiver) {
      const rs = Reflect.set(target, p, newValue, receiver);
      if (!proxyKeys.includes(p as string)) {
        return rs;
      }
      const currentDOM = targetObject.dom;
      const nextDOM = domilySchema.render();
      targetObject.dom = replaceDOM(currentDOM, nextDOM);
      return rs;
    },
  });
  return domilySchemaProxy;
}

export function removeDOM(dom: HTMLElement | Node | ShadowRoot) {
  if ("remove" in dom && typeof dom.remove === "function") {
    dom.remove();
    return;
  }
  if (dom && dom.parentNode) {
    dom.parentNode.removeChild(dom);
    return;
  }
  if ("outerHTML" in dom) {
    dom.outerHTML = "";
    return;
  }
  if (dom.nodeName === "#document-fragment") {
    dom.childNodes.forEach((e) => removeDOM(e));
    return;
  }
  throw new Error("[DOMily] removeDOM is not supported in this environment");
}

export function replaceDOM(
  original: HTMLElement | Node | ShadowRoot | null,
  dom: HTMLElement | Node | ShadowRoot | null
) {
  if (!original) {
    return dom;
  }
  if (!dom) {
    removeDOM(original);
    return dom;
  }
  if ("replaceWith" in original && typeof original.replaceWith === "function") {
    original.replaceWith(dom);
    return dom;
  }
  if (original && original.parentNode) {
    original.parentNode.replaceChild(dom, original);
    return dom;
  }
  if ("outerHTML" in original && "outerHTML" in dom) {
    original.outerHTML = dom.outerHTML;
    return dom;
  }
  throw new Error("[DOMily] replaceDOM is not supported in this environment");
}

export function mountable<
  K extends string,
  T extends {
    [k in K]: HTMLElement | Node | null;
  }
>(data: T, domKey = "dom" as K) {
  return {
    ...data,
    unmount: noop,
    mount(
      parent: HTMLElement | Document | ShadowRoot | string = document.body
    ) {
      this.unmount = domMountToParent(data[domKey], parent);
    },
  };
}
