import { stoppableEffect, type WithFuncType } from "../../reactive";
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
  ILifecycleItem,
} from "../type/types";
import { EventBus, EVENTS } from "../../../utils/event-bus";

/**
 * obj is DomilyRenderSchema
 * - class DomilyRenderSchema
 */
export function isDomilyRenderSchema(
  obj: object
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
  obj: object
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
  obj: object
): obj is DOMilyMountableRender<any, any> {
  return (
    isObject(obj) &&
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
  obj: object
): obj is IDomilyRenderOptions<any, any> {
  return (
    isObject(obj) &&
    "tag" in obj &&
    typeof obj.tag === "string" &&
    !!obj.tag.trim()
  );
}

export function gatherLifeCycle(
  item?: ILifecycleItem,
  schema?: DomilyRenderSchema<any, any> | null
) {
  if (isObject(item) && isFunction(schema?.mounted)) {
    item.mounted = schema.mounted;
  }
  if (isObject(item) && isFunction(schema?.unmounted)) {
    item.unmounted = schema.unmounted;
  }
}

export function domilyChildToDomilyRenderSchema(
  input?: WithFuncType<DOMilyChild>,
  gatherChildLifeCycle?: ILifecycleItem,
  gatherEffectAborts?: (() => void)[]
): DomilyRenderSchema<any, any> | null {
  if (!input) {
    return null;
  }

  if (isFunction(input)) {
    let originalSchema = domilyChildToDomilyRenderSchema(input());
    const stopEffect = stoppableEffect(() => {
      const nextSchema = domilyChildToDomilyRenderSchema(input());
      EventBus.emit(EVENTS.__INTERNAL_UPDATE, {
        nextSchema,
        originalSchema,
      });
      originalSchema = nextSchema;
    });
    gatherLifeCycle(gatherChildLifeCycle, originalSchema);
    if (Array.isArray(gatherEffectAborts)) {
      gatherEffectAborts.push(stopEffect);
    }
    return originalSchema;
  }

  if (isDomilyRenderSchema(input)) {
    gatherLifeCycle(gatherChildLifeCycle, input);
    return input;
  }

  if (isDOMilyCustomElementComponent(input)) {
    const schema = domilyChildToDomilyRenderSchema(
      input.customElementComponent
    );
    if (!schema) {
      return null;
    }
    schema.customElement = merge(
      {
        enable: true,
        name: input.name,
      },
      schema.customElement
    );
    gatherLifeCycle(gatherChildLifeCycle, schema);
    return schema;
  }

  if (isDOMilyMountableRender(input)) {
    gatherLifeCycle(gatherChildLifeCycle, input.schema);
    return input.schema;
  }

  if (isDomilyRenderOptions(input)) {
    const schema = DomilyRenderSchema.create<any, any, any>(input);
    gatherLifeCycle(gatherChildLifeCycle, schema);
    return schema;
  }

  return null;
}

export function domilyChildToDOMilyMountableRender(
  input?: WithFuncType<DOMilyChild>
): DOMilyMountableRender<any, any, any> | null {
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

  return mountable(schema);
}

export function domilyChildToDOM(
  child: WithFuncType<DOMilyChild | DOMilyChildDOM>,
  gatherChildLifeCycleQueue?: ILifecycleItem[],
  gatherEffectAborts?: (() => void)[]
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

  if (isFunction(child)) {
    const el = child();
    if (el instanceof HTMLElement || el instanceof Node) {
      return el;
    }
  }

  const lifecycle: ILifecycleItem = { dom: null };

  const childSchema = domilyChildToDomilyRenderSchema(
    child as WithFuncType<DOMilyChild>,
    lifecycle,
    gatherEffectAborts
  );

  if (!childSchema) {
    return null;
  }

  const dom = childSchema.render();
  lifecycle.dom = dom;

  if (Array.isArray(gatherChildLifeCycleQueue)) {
    gatherChildLifeCycleQueue.push(lifecycle);
  }

  if (Array.isArray(gatherEffectAborts)) {
    childSchema.gatherInternalEffectAborts(gatherEffectAborts);
  }

  return dom;
}
