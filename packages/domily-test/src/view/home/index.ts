import { useRouter } from "@domily/router";
import { Domily, signal, cr, type WithBaseProps } from "@domily/runtime-core";

export default function Home({ namespace }: WithBaseProps) {
  const router = useRouter(namespace);

  const goDetails = () => {
    router.push({ name: "home-details" });
  };

  const title = signal();

  const input = {
    tag: "input",
    props: cr(() => ({
      value: title(),
    })),
    on: {
      input: (e) => {
        title(!e.target.value.trim() ? void 0 : e.target.value.trim());
      },
    },
  };

  return {
    tag: "div",
    className: "home-page",
    attrs: {
      title,
    },
    children: [
      {
        tag: "h1",
        text: title,
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
