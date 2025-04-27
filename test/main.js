import { Domily } from "../lib/index.esm.js";
import Page from "./page.dom.json" with { type: "json" };

// const routes = [
//   {
//     path: "/",
//     name: "home",
//     component: () => Page,
//   },
// ];

// Domily.app({
//   namespace: "test",
//   mode: "SPA",
//   routes,
// }).mount();

Domily.render({
  tag: "fragment",
  children: [
    {
      tag: "style",
      children: [
        {
          tag: "text",
          text: `html {height: 100%;}body {background-color: #eee;margin: 0;.header {width: 100%;height: 60px;background-color: #fff;display: flex;align-items: center;box-sizing: border-box;padding: 10px 20px;.logo {font-size: 20px;color: rgb(0, 109, 206);}svg {border: 1px solid red;}}}`,
        },
      ],
    },
    Page,
  ],
}).mount('#app');
