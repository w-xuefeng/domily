import { createHistoryRouter } from "@domily/router";
import { routes } from "./router";

const router = createHistoryRouter({
  base: "/domily",
  routes,
});

export default router;
