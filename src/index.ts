import DomilyRenderSchema, {
  type DOMilyChildren,
  type DOMilyEventKeys,
  type DOMilyTags,
} from "./core/schemas/render";
import { replaceDOM } from "./utils/dom";
import { HTMLElementTagName } from "./utils/tags";

export * as DOMUtils from "./utils/dom";
export * from "./core/schemas/render";

export interface DOMilyReturnType<
  K extends DOMilyTags,
  C extends DOMilyChildren = null,
  EK extends DOMilyEventKeys = DOMilyEventKeys
> {
  dom: HTMLElement | Node | string | null;
  schema: DomilyRenderSchema<K, C, EK>;
  mount: (parent?: HTMLElement | Document | ShadowRoot | string) => void;
  unmount: () => void;
  update: () => void;
}

export type DOMily<ElementName extends string> = {
  [k in DOMilyTags<ElementName>]: <
    K extends DOMilyTags,
    C extends DOMilyChildren,
    EK extends DOMilyEventKeys
  >(
    schema?: Omit<Partial<DomilyRenderSchema<K, C, EK>>, "tag">
  ) => DOMilyReturnType<K, C, EK>;
} & {
  render: <
    K extends DOMilyTags,
    C extends DOMilyChildren,
    EK extends DOMilyEventKeys
  >(
    schema: Partial<DomilyRenderSchema<K, C, EK>> & { tag: K }
  ) => DOMilyReturnType<K, C, EK>;
  registerElement<T extends string>(tag: T): DOMily<ElementName | T>;
};

export function createDomily<
  ElementNames extends string = keyof HTMLElementTagNameMap
>(customElement?: ElementNames[]) {
  const Domily = {
    render<
      K extends DOMilyTags<ElementNames>,
      C extends DOMilyChildren,
      EK extends DOMilyEventKeys
    >(schema: Partial<DomilyRenderSchema<K, C, EK>> & { tag: K }) {
      const domilySchema = DomilyRenderSchema.create<K, C, EK>(schema);
      const domilySchemaProxy = new Proxy(domilySchema, {
        set(target, p, newValue, receiver) {
          const rs = Reflect.set(target, p, newValue, receiver);
          returnValue.dom = replaceDOM(returnValue.dom, domilySchema.render());
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
    registerElement<T extends string>(tag: T) {
      Reflect.set(
        Domily,
        tag,
        (schema?: Omit<Partial<DomilyRenderSchema<T, any, any>>, "tag">) => {
          return Domily.render<any, any, any>({
            ...schema,
            tag,
          });
        }
      );
      return Domily as DOMily<ElementNames | T>;
    },
  };
  Object.keys(HTMLElementTagName).forEach((tag) => {
    Domily.registerElement(tag);
  });
  if (customElement?.length) {
    customElement.forEach((tag) => {
      Domily.registerElement(tag);
    });
  }
  return Domily as DOMily<ElementNames>;
}

export const Domily = createDomily();
