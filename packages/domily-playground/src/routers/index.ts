import { createHistoryRouter } from "@domily/router";
import { routes } from "./router";

const router = createHistoryRouter({
  base: "/",
  routes,
});

export default router;
