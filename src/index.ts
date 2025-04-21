import DomilyRenderSchema, {
  type DOMilyChildren,
  type DOMilyEventKeys,
  type DOMilyTags,
} from "./core/schemas/render";
import { HTMLElementTagName } from "./utils/tags";

export * as DOMUtils from "./utils/dom";
export * from "./core/schemas/render";

export interface DOMilyReturnType<
  K extends DOMilyTags,
  C extends DOMilyChildren = null,
  EK extends DOMilyEventKeys = DOMilyEventKeys
> {
  dom: HTMLElement | Node | null;
  schema: DomilyRenderSchema<K, C, EK>;
  obtainSchema: () => Partial<DomilyRenderSchema<K, C, EK>> & { tag: K };
  mount: (parent?: HTMLElement | Document | ShadowRoot | string) => void;
  unmount: () => void;
}

export type DOMily = {
  [k in keyof typeof HTMLElementTagName]: <
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
};

function main() {
  const Domily = {
    render<
      K extends DOMilyTags,
      C extends DOMilyChildren,
      EK extends DOMilyEventKeys
    >(schema: Partial<DomilyRenderSchema<K, C, EK>> & { tag: K }) {
      const obtainSchema = () => DomilyRenderSchema.create<K, C, EK>(schema);
      const domilyRenderSchema = obtainSchema();
      const dom = domilyRenderSchema.render();
      let mounted = false;
      let container: HTMLElement | Document | ShadowRoot | null = null;
      return {
        dom,
        schema: domilyRenderSchema,
        obtainSchema,
        mount: (
          parent: HTMLElement | Document | ShadowRoot | string = document.body
        ) => {
          if (!dom) {
            return;
          }
          container =
            typeof parent === "string"
              ? document.querySelector<HTMLElement>(parent)
              : parent;
          if (!container) {
            return;
          }
          container.append(dom);
          mounted = true;
        },
        unmount: () => {
          if (!mounted || !container || !dom) {
            return;
          }
          container.removeChild(dom);
          mounted = false;
        },
      };
    },
  };
  Object.keys(HTMLElementTagName).forEach((tag) => {
    Reflect.set(
      Domily,
      tag,
      <
        K extends DOMilyTags,
        C extends DOMilyChildren,
        EK extends DOMilyEventKeys
      >(
        schema?: Omit<Partial<DomilyRenderSchema<K, C, EK>>, "tag">
      ) => {
        return Domily.render({ tag: tag as K, ...schema });
      }
    );
  });
  return Domily as DOMily;
}

export default main();
