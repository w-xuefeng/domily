import { mountable, txt } from "../../../utils/dom";
import { isFunction, isObject } from "../../../utils/is";
import { merge } from "../../../utils/obj";
import DomilyRenderSchema from "../schema";
import type {
  DOMilyChild,
  DOMilyChildDOM,
  DOMilyCustomElementComponent,
  DOMilyMountableRender,
  IDomilyRenderOptions,
} from "../type/types";

/**
 * obj is DomilyRenderSchema
 * - class DomilyRenderSchema
 */
export function isDomilyRenderSchema(
  obj: object,
): obj is DomilyRenderSchema<any, any> {
  return (
    obj instanceof DomilyRenderSchema ||
    ("render" in obj &&
      "tag" in obj &&
      isFunction(obj.render) &&
      typeof obj.tag === "string" &&
      !!obj.tag.trim())
  );
}

/**
 * obj is DOMilyCustomElementComponent
 * - { name, customElementComponent }
 */
export function isDOMilyCustomElementComponent(
  obj: object,
): obj is DOMilyCustomElementComponent<any, any> {
  return (
    isObject(obj) &&
    "name" in obj &&
    typeof obj.name === "string" &&
    !!obj.name.trim() &&
    "customElementComponent" in obj &&
    isObject(obj.customElementComponent) &&
    "tag" in obj.customElementComponent &&
    typeof obj.customElementComponent.tag === "string" &&
    !!obj.customElementComponent.tag.trim()
  );
}

/**
 * obj is DOMilyMountableRender
 * - { dom, schema, mount, unmount }
 */
export function isDOMilyMountableRender(
  obj: object,
): obj is DOMilyMountableRender<any, any> {
  return (
    isObject(obj) &&
    "dom" in obj &&
    "schema" in obj &&
    isObject(obj.schema) &&
    isDomilyRenderSchema(obj.schema) &&
    "mount" in obj &&
    isFunction(obj.mount) &&
    "unmount" in obj &&
    isFunction(obj.unmount)
  );
}

/**
 * obj is IDomilyRenderOptions
 * - { tag }
 */
export function isDomilyRenderOptions(
  obj: object,
): obj is IDomilyRenderOptions<any, any> {
  return (
    isObject(obj) &&
    "tag" in obj &&
    typeof obj.tag === "string" &&
    !!obj.tag.trim()
  );
}

export function domilyChildToDomilyRenderSchema(
  input?: DOMilyChild,
): DomilyRenderSchema<any, any> | null {
  if (!input) {
    return null;
  }

  if (isDomilyRenderSchema(input)) {
    return input;
  }

  if (isDOMilyCustomElementComponent(input)) {
    const schema = domilyChildToDomilyRenderSchema(
      input.customElementComponent,
    );
    if (!schema) {
      return null;
    }
    schema.customElement = merge(
      {
        enable: true,
        name: input.name,
      },
      schema.customElement,
    );
    return schema;
  }

  if (isDOMilyMountableRender(input)) {
    return input.schema;
  }

  if (isDomilyRenderOptions(input)) {
    return DomilyRenderSchema.create<any, any, any>(input);
  }

  return null;
}

export function domilyChildToDOMilyMountableRender(
  input?: DOMilyChild,
): DOMilyMountableRender<any, any> | null {
  if (!input) {
    return null;
  }

  if (isDOMilyMountableRender(input)) {
    return input;
  }

  const schema = domilyChildToDomilyRenderSchema(input);

  if (!schema) {
    return null;
  }

  return mountable(
    {
      schema,
      dom: schema.render(),
    },
    "dom",
  );
}

export function domilyChildToDOM(
  child: DOMilyChild | DOMilyChildDOM,
): HTMLElement | Node | null {
  if (!child) {
    return null;
  }
  if (child instanceof HTMLElement || child instanceof Node) {
    return child;
  }
  if (typeof child === "string") {
    return txt(child);
  }
  const childSchema = domilyChildToDomilyRenderSchema(child);
  if (!childSchema) {
    return null;
  }
  return childSchema.render();
}
