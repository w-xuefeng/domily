import { type IDomilyPageSchema } from "@domily/router";

export const routes: IDomilyPageSchema[] = [
  {
    name: "index",
    path: "/",
    component: import("../view/layout"),
  },
  {
    name: "map-list",
    path: "/map-list",
    component: import("../view/map-list"),
  },
  {
    name: "not-found",
    path: "*",
    component: import("../view/404"),
  },
];
