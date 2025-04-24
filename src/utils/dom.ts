import DomilyRenderSchema from "../core/schemas/render";
import type {
  WithCustomElementTagNameMap,
  TDomilyRenderProperties,
  IElementTagNameMap,
} from "../core/types/tags";

export const noop = () => {};

export function $<E extends Element = Element>(
  selector: string,
  container: HTMLElement | Document = document
) {
  return container.querySelector<E>(selector);
}

export function $$<E extends Element = Element>(
  selector: string,
  container: HTMLElement | Document = document
) {
  return Array.from(container.querySelectorAll<E>(selector));
}

export function $item<E extends Element = Element>(
  [selector, i]: [q: string, i: number],
  container: HTMLElement | Document = document
) {
  return Array.from($<E>(selector, container)?.children || []).at(i);
}

export function $option<E extends Element = Element>(
  [selector, key, value]: [selector: string, key: keyof E, value: string],
  container: HTMLElement | Document = document
) {
  return $$<E>(selector, container).find((e) => e[key] === value);
}

export function $optionIncludes<E extends Element = Element>(
  [selector, key, value]: [selector: string, key: keyof E, value: string],
  container: HTMLElement | Document = document
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
  container: HTMLElement | Document = document
) {
  return (
    typeof selector === "string" ? $(selector, container) : selector
  )?.dispatchEvent(event);
}

export function $dispatchEvent<K extends keyof WindowEventMap>(
  [selector, event]: [selector: string | HTMLElement, event: WindowEventMap[K]],
  container: HTMLElement | Document = document
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

export function f(children: (HTMLElement | Node | string | null)[] = []) {
  const documentFragment = document.createDocumentFragment();
  for (const child of children) {
    if (child) {
      documentFragment.append(child);
    }
  }
  return documentFragment;
}

export function c(data: string) {
  const comment = document.createComment(data);
  return comment;
}

export function h<
  CustomTagNameMap,
  K extends keyof WithCustomElementTagNameMap<CustomTagNameMap>
>(
  tagName: K,
  properties?: TDomilyRenderProperties<CustomTagNameMap, K> | null,
  children?: (HTMLElement | Node | string)[] | string | HTMLElement | Node
): WithCustomElementTagNameMap<CustomTagNameMap>[K];

export function h<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  properties?: TDomilyRenderProperties<IElementTagNameMap, K> | null,
  children?: (HTMLElement | Node | string)[] | string | HTMLElement | Node
) {
  const container = document.createElement<K>(tagName);
  if (properties) {
    Object.entries(properties).forEach(([k, v]) => {
      if (k === "arrts" && typeof v === "object" && v !== null) {
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
            .map(([sk, sv]) => `${sk}:${sv}`)
            .join(";");
          Reflect.set(container.style, "cssText", cssText);
        } else if (typeof v === "string") {
          Reflect.set(container.style, "cssText", v);
        }
      } else if (k !== "arrts" && k !== "on" && k !== "style") {
        Reflect.set(container, k, v);
      }
    });
  }
  if (children) {
    container.append(f(Array.isArray(children) ? children : [children]));
  }
  return container;
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
    if (dom) container.removeChild(dom);
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
      // if (currentDOM && nextDOM) {
      //   /**
      //    * modify
      //    */
      //   targetObject.dom = replaceDOM(currentDOM, nextDOM);
      // } else if (currentDOM && !nextDOM) {
      //   /**
      //    * remove
      //    */
      //   // eventBus.emit(EVENTS.DOM_SNAPSHOT, currentDOM.parentElement);
      //   targetObject.dom = replaceDOM(currentDOM, nextDOM);
      // } else if (!currentDOM && nextDOM) {
      //   /**
      //    * insert (recover)
      //    */
      //   if (
      //     domilySchema.parentElement &&
      //     domilySchema.nextSibling &&
      //     domilySchema.parentElement.contains(domilySchema.nextSibling)
      //   ) {
      //     domilySchema.parentElement.insertBefore(
      //       nextDOM,
      //       domilySchema.nextSibling
      //     );
      //   } else if (
      //     domilySchema.parentElement &&
      //     domilySchema.previousSibling &&
      //     domilySchema.parentElement.contains(domilySchema.previousSibling)
      //   ) {
      //     domilySchema.parentElement.insertBefore(
      //       nextDOM,
      //       domilySchema.previousSibling.nextSibling
      //     );
      //   } else if (
      //     domilySchema.parentElement &&
      //     domilySchema.index > -1 &&
      //     domilySchema.index < domilySchema.parentElement.childNodes.length
      //   ) {
      //     domilySchema.parentElement.insertBefore(
      //       nextDOM,
      //       domilySchema.parentElement.childNodes[domilySchema.index]
      //     );
      //   } else if (
      //     domilySchema.parentElement &&
      //     domilySchema.index >= domilySchema.parentElement.childNodes.length
      //   ) {
      //     domilySchema.parentElement.appendChild(nextDOM);
      //   }
      //   targetObject.dom = nextDOM;
      // }
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
