import { Domily } from "../lib/index.esm.js";
import Home from "./home.json" with { type: "json" };
import HomeDetails from "./home-details.json" with { type: "json" };
import Test from "./test.json" with { type: "json" };

const routes = [
  {
    path: '/',
    redirect: {
      path: '/home'
    }
  },
  {
    path: "/home",
    name: "home",
    component: () => Home,
    children: [
      {
        path: '/home/details',
        name: "home-details",
        component: () => HomeDetails
      }
    ]
  },
  {
    path: "/test",
    name: "test",
    component: () => Test,
  },
];

Domily.app({
  namespace: "test",
  mode: "SPA",
  routes,
}).mount();
