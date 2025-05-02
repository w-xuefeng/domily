import DomilyRouterBase from './base';
import DomilyHashRouter from './hash';
import DomilyHistoryRouter from './history';

export const DomilyRouter = { DomilyRouterBase, DomilyHashRouter, DomilyHistoryRouter };

if (!Reflect.get(globalThis, 'DomilyRouter')) {
  Reflect.defineProperty(globalThis, 'DomilyRouter', {
    value: DomilyRouter,
  });
}
