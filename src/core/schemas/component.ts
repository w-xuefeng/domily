import { mountable, proxyDomilySchema } from "../../utils/dom";
import DomilyRenderSchema, {
  DOMilyRenderReturnType,
  IDomilyRenderSchema,
} from "./render";

export interface DOMilyComponent {
  ():
    | DomilyRenderSchema
    | IDomilyRenderSchema<any, any>
    | DOMilyRenderReturnType<any, any>;
}

export type AsyncDOMilyComponentModule = Promise<{ default: DOMilyComponent }>;

export function parseComponent(functionComponent: DOMilyComponent) {
  const comp = functionComponent();
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
