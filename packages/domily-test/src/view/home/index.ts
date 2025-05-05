import { Domily } from "@domily/runtime-core";

export default function Home() {
  return Domily.div({
    className: "home-page",
    children: ["home", Domily["router-view"]()],
  });
}
