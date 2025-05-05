import { createHashRouter, createHistoryRouter } from '@domily/router';
import { routes } from './router';
import { isLogin } from '../utils';

const router = (namespace: string) => {
  const router = createHistoryRouter({
    base: '/',
    routes: routes(namespace),
  });

  router.beforeEach((from, to, next) => {
    if (to?.meta?.authorize && !isLogin()) {
      next(`/login?redirect=${encodeURIComponent(to?.fullPath)}`);
    } else {
      next();
    }
  });

  router.afterEach(e => {
    if (e?.meta?.title) {
      document.title = e.meta.title;
    }
  });

  return router;
};

export default router;
