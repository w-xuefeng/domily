import { createDomily, type IDomilyPageSchema } from "@domily/runtime-core";

const Domily = createDomily();

const routes: IDomilyPageSchema[] = [
  {
    path: "/",
    redirect: {
      name: "home",
    },
  },
  {
    name: "home",
    path: "/home",
    component: import("./components/home.d.md"),
  },
  {
    name: "test",
    path: "/test",
    component: import("./components/test.d.md"),
  },
];
Domily.app({
  namespace: "domily",
  routes,
}).mount();
