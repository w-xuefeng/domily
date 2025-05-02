import { createDomily, type IDomilyPageSchema } from "@domily/runtime-core";
import App from "./app";
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
            children: [
              {
                name: "home-params-details",
                path: "/home/details/:id",
                component: import("./view/details/params"),
              },
            ],
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
  app: App(),
  routes,
}).mount();
