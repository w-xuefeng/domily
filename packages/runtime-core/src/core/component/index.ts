import type {
  DOMilyCustomElementComponent,
  DOMilyMountableRender,
  IDomilyRenderOptions,
} from "../render";
import DomilyRenderSchema from "../render/schema";
import { domilyChildToDOMilyMountableRender } from "../render/shared/parse";

export interface DOMilyComponent {
  (props?: any[]):
    | DomilyRenderSchema
    | IDomilyRenderOptions<any, any>
    | DOMilyMountableRender<any, any>
    | DOMilyCustomElementComponent;
}

export type AsyncDOMilyComponentModule = Promise<{ default: DOMilyComponent }>;

export const DomilyComponentWeakMap = new WeakMap<
  Function,
  DOMilyMountableRender<any, any>
>();

export function parseComponent(
  functionComponent: DOMilyComponent,
  nocache = false
) {
  const cache = DomilyComponentWeakMap.get(functionComponent);
  if (cache && !nocache) {
    return cache;
  }
  const comp = functionComponent();
  const mountable = domilyChildToDOMilyMountableRender(comp);
  if (!mountable) {
    return null;
  }
  DomilyComponentWeakMap.set(functionComponent, mountable);
  return mountable;
}
