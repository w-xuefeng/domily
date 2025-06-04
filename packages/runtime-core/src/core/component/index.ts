import type { WithFuncType } from "../reactive/type";
import type {
  DOMilyCustomElementComponent,
  DOMilyMountableRender,
  IDomilyRenderOptions,
} from "../render";
import DomilyRenderSchema from "../render/schema";
import { domilyChildToDOMilyMountableRender } from "../render/shared/parse";

export * from "./builtin";

export interface DOMilyComponent {
  (props?: any):
    | WithFuncType<DomilyRenderSchema>
    | WithFuncType<IDomilyRenderOptions<any, any>>
    | WithFuncType<DOMilyMountableRender<any, any>>
    | WithFuncType<DOMilyCustomElementComponent>;
}

export type AsyncDOMilyComponentModule = Promise<{ default: DOMilyComponent }>;

export const DomilyComponentWeakMap = new WeakMap<
  Function,
  Map<string, DOMilyMountableRender<any, any>>
>();

export function parseComponent(
  props: Record<string, any>,
  functionComponent: DOMilyComponent,
  nocache = false
) {
  const cacheMap = DomilyComponentWeakMap.get(functionComponent);
  const propsKey = JSON.stringify(props);
  if (cacheMap && !nocache) {
    const cache = cacheMap.get(propsKey);
    if (cache) {
      return cache;
    }
  }
  const comp = functionComponent(props);
  const mountable = domilyChildToDOMilyMountableRender(comp);
  if (!mountable) {
    return null;
  }
  if (!cacheMap) {
    DomilyComponentWeakMap.set(
      functionComponent,
      new Map<string, DOMilyMountableRender<any, any>>([[propsKey, mountable]])
    );
  } else {
    cacheMap.set(propsKey, mountable);
    DomilyComponentWeakMap.set(functionComponent, cacheMap);
  }
  return mountable;
}
