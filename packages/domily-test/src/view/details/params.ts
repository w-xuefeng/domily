import { Domily } from "@domily/runtime-core";

export default function HomeDetails() {
  return Domily.div({
    className: "home-details-params-page",
    children: ["home-params-details"],
  });
}
