import { CustomElementTagName } from "./tags";

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

export function h<K extends keyof CustomElementTagName>(
  tagName: K,
  properties?:
    | (Partial<
        Record<keyof HTMLElement | keyof CustomElementTagName[K], any>
      > & {
        attrs?: Record<string, string>;
        on?: Record<
          string | keyof HTMLElementEventMap,
          | EventListenerOrEventListenerObject
          | {
              event: EventListenerOrEventListenerObject;
              option?: boolean | AddEventListenerOptions;
            }
        >;
        [k: string]: any;
      })
    | null,
  children?: (HTMLElement | Node | string)[] | string | HTMLElement | Node
): CustomElementTagName[K];

export function h<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  properties?:
    | (Partial<Record<keyof HTMLElement, any>> & {
        attrs?: Record<string, string>;
        on?: Record<
          string | keyof HTMLElementEventMap,
          | EventListenerOrEventListenerObject
          | {
              event: EventListenerOrEventListenerObject;
              option?: boolean | AddEventListenerOptions;
            }
        >;
        [k: string]: any;
      })
    | null,
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
          Object.entries(v).forEach(([sk, sv]) => {
            Reflect.set(container.style, sk, sv);
          });
        } else if (typeof v === "string") {
          Reflect.set(container.style, "cssText", v);
        }
      } else if (k !== "arrts" && k !== "on" && k !== "style") {
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
