import DomilyRenderSchema, {
  type IDomilyRenderSchema,
  type DOMilyTags,
} from "./core/schemas/render";
import type {
  WithCustomElementTagNameMap,
  OptionalWith,
  CustomParamsToMap,
} from "./core/types/tags";
import { domMountToParent, f, noop, proxyDomilySchema } from "./utils/dom";
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

export interface DOMilyFragmentReturnType {
  dom: (HTMLElement | Node | null)[];
  fragment: DocumentFragment;
  schema: DomilyRenderSchema<any, any>[];
  mount: (parent?: HTMLElement | Document | ShadowRoot | string) => void;
  unmount: () => void;
}

export type DOMilyBase<CustomTagNameMap = {}> = {
  render: <K extends DOMilyTags<CustomTagNameMap>>(
    schema: IDomilyRenderSchema<CustomTagNameMap, K>
  ) => DOMilyReturnType<CustomTagNameMap, K>;
  fragment: (
    children: (IDomilyRenderSchema<any, any> | DOMilyReturnType<any, any>)[]
  ) => DOMilyFragmentReturnType;
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
      const returnValue = {
        dom: domilySchema.render(),
        schema: domilySchema,
        unmount: noop,
        mount(
          parent: HTMLElement | Document | ShadowRoot | string = document.body
        ) {
          this.unmount = domMountToParent(this.dom, parent);
        },
      };
      returnValue.schema = proxyDomilySchema(domilySchema, returnValue);
      return returnValue;
    },
    fragment: (
      children: (IDomilyRenderSchema<any, any> | DOMilyReturnType<any, any>)[]
    ) => {
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
      const returnValue = {
        fragment: f(dom),
        dom,
        schema,
        unmount: noop,
        mount(
          parent: HTMLElement | Document | ShadowRoot | string = document.body
        ) {
          this.unmount = domMountToParent(this.fragment, parent);
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
  return Domily as unknown as DOMily;
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
