import { Domily } from "../lib/index.esm.js";

const routes = [
  {
    path: "/",
    name: "home",
    component: import("./component.js"),
  },
];

Domily.app({
  namespace: "test",
  mode: "SPA",
  routes,
}).mount();
