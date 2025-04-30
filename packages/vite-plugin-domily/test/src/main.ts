import { createDomily, type IDomilyPageSchema } from "@domily/runtime-core";
import "./css.css";

const Domily = createDomily();

const routes: IDomilyPageSchema[] = [
  {
    name: "index",
    path: "/",
    component: import("./view/layout"),
    meta: {
      authorize: [],
    },
    children: [
      {
        name: "home",
        path: "/home",
        component: import("./view/home"),
        children: [
          {
            name: "home-details",
            path: "/home/details",
            component: import("./view/details"),
          },
        ],
      },
    ],
  },
  {
    name: "login",
    path: "/login",
    component: import("./view/login"),
  },
];
Domily.app({
  namespace: "domily",
  app: Domily["router-view"](),
  routes,
}).mount();
