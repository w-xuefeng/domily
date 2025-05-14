import { type IDomilyPageSchema } from "@domily/router";

export const routes: IDomilyPageSchema[] = [
  {
    name: "index",
    path: "/",
    component: import("../view/layout"),
  },
  {
    name: "not-found",
    path: "*",
    component: import("../view/404"),
  },
];
