import DomilyRenderSchema, {
  type IDomilyRenderSchema,
  type DOMilyTags,
} from "./core/schemas/render";
import type {
  WithCustomElementTagNameMap,
  OptionalWith,
  CustomParamsToMap,
} from "./core/types/tags";
import { replaceDOM } from "./utils/dom";
import { HTMLElementTagName } from "./utils/tags";

export * as DOMUtils from "./utils/dom";
export * from "./core/schemas/render";

export interface DOMilyReturnType<
  CustomTagNameMap,
  K extends DOMilyTags<CustomTagNameMap>
> {
  dom:
    | (K extends keyof WithCustomElementTagNameMap<CustomTagNameMap>
        ? WithCustomElementTagNameMap<CustomTagNameMap>[K]
        : HTMLElement | Node | Text)
    | null;
  schema: DomilyRenderSchema<CustomTagNameMap, K>;
  mount: (parent?: HTMLElement | Document | ShadowRoot | string) => void;
  unmount: () => void;
}

export type DOMilyBase<CustomTagNameMap = {}> = {
  render: <K extends DOMilyTags<CustomTagNameMap>>(
    schema: IDomilyRenderSchema<CustomTagNameMap, K>
  ) => DOMilyReturnType<CustomTagNameMap, K>;
  registerElement<T extends string>(
    tag: T,
    constructor?: CustomElementConstructor | undefined
  ): DOMily<
    typeof constructor extends new (...args: any) => infer R
      ? CustomTagNameMap & { [key in T]: R }
      : CustomTagNameMap
  >;
};

export type DOMily<CustomTagNameMap = {}> = {
  [T in DOMilyTags<CustomTagNameMap>]: (
    schema?: Omit<IDomilyRenderSchema<CustomTagNameMap, T>, "tag">
  ) => DOMilyReturnType<CustomTagNameMap, T>;
} & DOMilyBase<CustomTagNameMap>;

function builtinDomily() {
  const Domily = {
    render<K extends DOMilyTags>(schema: IDomilyRenderSchema<{}, K>) {
      const domilySchema = DomilyRenderSchema.create<{}, K>(schema);
      const domilySchemaProxy = new Proxy(domilySchema, {
        set(target, p, newValue, receiver) {
          const rs = Reflect.set(target, p, newValue, receiver);
          const currentDOM = returnValue.dom;
          const nextDOM = domilySchema.render();
          if (currentDOM && nextDOM) {
            // modify
            returnValue.dom = replaceDOM(currentDOM, nextDOM);
          } else if (currentDOM && !nextDOM) {
            // remove
            returnValue.dom = replaceDOM(currentDOM, nextDOM);
          } else if (
            !currentDOM &&
            nextDOM &&
            domilySchema.parentElement &&
            domilySchema.nextSibling
          ) {
            // insert
            domilySchema.parentElement.insertBefore(
              nextDOM,
              domilySchema.nextSibling
            );
            returnValue.dom = nextDOM;
          }
          return rs;
        },
      });

      const returnValue = {
        dom: domilySchema.render(),
        schema: domilySchemaProxy,
        unmount: () => {},
        mount(
          parent: HTMLElement | Document | ShadowRoot | string = document.body
        ) {
          if (!this.dom) {
            return;
          }
          const container =
            typeof parent === "string"
              ? document.querySelector<HTMLElement>(parent)
              : parent;
          if (!container) {
            return;
          }
          container.append(this.dom);
          this.unmount = () => {
            if (this.dom) container.removeChild(this.dom);
            this.dom = null;
          };
        },
      };
      return returnValue;
    },
    registerElement<T extends string>(
      tag: T,
      constructor?: CustomElementConstructor | undefined
    ) {
      if (constructor && !customElements.get(tag)) {
        customElements.define(tag, constructor);
      }
      Reflect.set(Domily, tag, (schema?: Record<string, any>) => {
        return Domily.render({ ...schema, tag } as any);
      });
      return Domily;
    },
  };
  Object.keys(HTMLElementTagName).forEach((tag) => {
    Domily.registerElement(tag);
  });
  // @ts-ignore
  return Domily as DOMily;
}

function registerCustomElements<T extends DOMily, P extends string[] | object>(
  Domily: T,
  needRegisterCustomElements?: P
) {
  if (!needRegisterCustomElements) {
    return Domily as OptionalWith<T, P, DOMily<CustomParamsToMap<P>>>;
  }
  if (
    Array.isArray(needRegisterCustomElements) &&
    needRegisterCustomElements.length
  ) {
    needRegisterCustomElements.forEach((tag) => {
      Domily.registerElement(tag);
    });
  } else if (
    typeof needRegisterCustomElements === "object" &&
    needRegisterCustomElements !== null
  ) {
    Object.keys(needRegisterCustomElements).forEach((tag) => {
      const value =
        needRegisterCustomElements[
          tag as keyof typeof needRegisterCustomElements
        ];
      if (!value) {
        Domily.registerElement(tag);
      } else if (typeof value === "function") {
        Domily.registerElement(tag, value as CustomElementConstructor);
      }
    });
  }
  return Domily as OptionalWith<T, P, DOMily<CustomParamsToMap<P>>>;
}

export function createDomily<T extends string[] | object = {}>(
  customElement?: T
) {
  return registerCustomElements(builtinDomily(), customElement);
}

export const Domily = createDomily();
