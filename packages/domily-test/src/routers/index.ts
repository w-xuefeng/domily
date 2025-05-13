import { createHistoryRouter } from "@domily/router";
import { routes } from "./router";
import { isLogin } from "../utils";

const router = createHistoryRouter({
  base: "/",
  routes,
});

router.beforeEach((from, to, next) => {
  if (to?.meta?.authorize && !isLogin()) {
    next(`/login?redirect=${encodeURIComponent(to?.fullPath)}`);
  } else {
    next();
  }
});

router.afterEach((e) => {
  if (e?.meta?.title) {
    document.title = e.meta.title;
  }
});

export default router;
