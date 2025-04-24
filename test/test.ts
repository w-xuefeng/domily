import { Domily } from "../src";

Domily.fragment([
  {
    tag: "div",
    text: "d1",
  },
  {
    tag: "div",
    text: "d2",
  },
  Domily.div({
    text: "d3",
  }),
]);
