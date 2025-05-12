import { useRoute } from "@domily/router";
import { Domily } from "@domily/runtime-core";
const { div } = Domily;

export default function HomeDetails({ namespace }) {
  const route = useRoute(namespace);
  return div({
    className: "home-details-params-page",
    children: [
      {
        tag: "div",
        text: `query: ${JSON.stringify(route.query)}`,
      },
      {
        tag: "div",
        text: `params: ${JSON.stringify(route.params)}`,
      },
    ],
  });
}
