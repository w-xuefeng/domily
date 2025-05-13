import { useRouter } from "@domily/router";
import { Domily, signal, cr } from "@domily/runtime-core";

export default function Home() {
  const router = useRouter();

  const goDetails = () => {
    router.push({ name: "home-details" });
  };

  const title = signal<string>("1");

  let timer;

  const mounted = () => {
    timer = setInterval(() => {
      title(`${Number(title()) + 1}`);
    }, 1000);
  };
  const unmounted = () => {
    clearInterval(timer);
  };

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
    mounted,
    unmounted,
  };
}
