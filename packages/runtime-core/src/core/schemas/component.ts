import { mountable, proxyDomilySchema } from "../../utils/dom";
import { merge } from "../../utils/obj";
import DomilyRenderSchema, {
  type DOMilyRenderReturnType,
  type IDomilyCustomElementOptions,
  type IDomilyRenderSchema,
} from "./render";

export interface DOMilyCustomElementComponent {
  name: string;
  customElementComponent:
    | DomilyRenderSchema
    | IDomilyRenderSchema<any, any>
    | DOMilyRenderReturnType<any, any>;
}
export interface DOMilyComponent {
  ():
    | DomilyRenderSchema
    | IDomilyRenderSchema<any, any>
    | DOMilyRenderReturnType<any, any>
    | DOMilyCustomElementComponent;
}

export type AsyncDOMilyComponentModule = Promise<{ default: DOMilyComponent }>;

export const DomilyComponentWeakMap = new WeakMap<
  Function,
  DOMilyRenderReturnType<any, any>
>();

export function parseDomilyComponentSchema(
  comp:
    | DomilyRenderSchema
    | IDomilyRenderSchema<any, any>
    | DOMilyRenderReturnType<any, any>,
  customElement?: IDomilyCustomElementOptions
) {
  if (
    typeof comp === "object" &&
    comp &&
    "dom" in comp &&
    "schema" in comp &&
    typeof comp.schema === "object"
  ) {
    return comp;
  }
  if (comp instanceof DomilyRenderSchema) {
    return {
      schema: comp,
      dom: comp.render(),
    };
  }
  if (customElement && customElement.enable) {
    (comp as IDomilyRenderSchema<any, any>).customElement = merge(
      customElement,
      (comp as IDomilyRenderSchema<any, any>).customElement
    );
  }
  const schema = DomilyRenderSchema.create(
    comp as IDomilyRenderSchema<any, any>
  );
  return {
    schema,
    dom: schema.render(),
  };
}

export function parseDomilyComponent(
  comp:
    | DomilyRenderSchema
    | IDomilyRenderSchema<any, any>
    | DOMilyRenderReturnType<any, any>,
  customElement?: IDomilyCustomElementOptions
) {
  if (
    typeof comp === "object" &&
    comp &&
    "dom" in comp &&
    "schema" in comp &&
    typeof comp.schema === "object"
  ) {
    return comp;
  }
  if (comp instanceof DomilyRenderSchema) {
    const node = mountable(
      {
        schema: comp,
        dom: comp.render(),
      },
      "dom"
    );
    node.schema = proxyDomilySchema(comp, node);
    return node;
  }

  /**
   * The customElement in the IDomilyRenderSchema has a higher priority than the external one
   * prioritize taking values from IDomilyRenderSchema.customElement,
   * if undefined, then take values from outside
   */
  if (customElement && customElement.enable) {
    (comp as IDomilyRenderSchema<any, any>).customElement = merge(
      customElement,
      (comp as IDomilyRenderSchema<any, any>).customElement
    );
  }

  const schema = DomilyRenderSchema.create(
    comp as IDomilyRenderSchema<any, any>
  );
  const node = mountable(
    {
      schema,
      dom: schema.render(),
    },
    "dom"
  );
  node.schema = proxyDomilySchema(schema, node);
  return node;
}

export function parseComponent(
  functionComponent: DOMilyComponent,
  nocache = false
) {
  const cache = DomilyComponentWeakMap.get(functionComponent);
  if (cache && !nocache) {
    return cache;
  }
  const comp = functionComponent();
  if ("name" in comp && "customElementComponent" in comp) {
    const result = parseDomilyComponent(comp.customElementComponent, {
      enable: true,
      name: comp.name,
    });
    DomilyComponentWeakMap.set(functionComponent, result);
    return result;
  }
  const result = parseDomilyComponent(comp);
  DomilyComponentWeakMap.set(functionComponent, result);
  return result;
}
