import { Domily } from "../lib/index.esm.js";
import Page from "./page.dom.json" with { type: "json" };

const routes = [
  {
    path: "/",
    name: "home",
    component: () => Page,
  },
];

Domily.app({
  namespace: "test",
  mode: "SPA",
  routes,
}).mount();
