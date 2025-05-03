import { createHashRouter } from "@domily/router";
import { routes } from "./router";

const router = (namespace: string) => {
  const router = createHashRouter({
    base: "/",
    routes: routes(namespace),
  });

  // router.beforeEach((from, to, next) => {
  //   console.log("🚀 ~ router.beforeEach ~ from, to:", from, to);
  //   next();
  // });

  return router;
};

export default router;
