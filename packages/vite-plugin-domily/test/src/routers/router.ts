import { type IDomilyPageSchema } from "@domily/router";

export const routes: (namespace: string) => IDomilyPageSchema[] = (
  namespace: string
) => [
  {
    namespace,
    name: "index",
    path: "/",
    component: import("../view/layout"),
    meta: {
      authorize: [],
    },
    children: [
      {
        name: "home",
        path: "/home",
        component: import("../view/home"),
        children: [
          {
            name: "home-details",
            path: "/home/details",
            component: import("../view/details"),
            children: [
              {
                name: "home-params-details",
                path: "/home/details/:id",
                component: import("../view/details/params"),
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
    component: import("../view/login"),
  },
];
