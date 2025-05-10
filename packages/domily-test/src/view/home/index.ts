import { useRouter } from "@domily/router";
import { Domily, cr, ref, type WithBaseProps } from "@domily/runtime-core";

export default function Home({ namespace }: WithBaseProps) {
  const router = useRouter(namespace);

  const goDetails = () => {
    router.push({ name: "home-details" });
  };

  const state = ref("title");

  const props = cr(() => ({
    title: state.value,
  }));

  const input = {
    tag: "input",
    props: {
      value: state.value,
    },
    on: {
      input: (e) => {
        state.value = e.target.value;
      },
    },
  };

  return {
    tag: "div",
    className: "home-page",
    props,
    children: [
      {
        tag: "h1",
        text: cr(() => state.value),
      },
      input,
      Domily.div({
        children: [
          Domily.button({
            text: "GO Details",
            on: {
              click: goDetails,
            },
          }),
        ],
      }),
      Domily["router-view"](),
    ],
  };
}
