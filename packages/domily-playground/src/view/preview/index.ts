import { effect } from "domily";
import type { ISignalFunc } from "domily";
import IconLoading from "@/assets/imgs/code-loading.svg";

export default function Preview(props: { code: ISignalFunc<string> }) {
  let url = "";
  const mounted = (dom: HTMLIFrameElement | null) => {
    effect(() => {
      if (!dom) {
        return;
      }
      if (url) {
        URL.revokeObjectURL(url);
      }
      const htmlFile = new Blob([props.code()], { type: "text/html" });
      url = URL.createObjectURL(htmlFile);
      dom.src = url;
    });
  };
  return {
    tag: "section",
    customElement: {
      enable: true,
      name: "preview-browser",
      useShadowDOM: true,
      shadowDOMMode: "open",
    },
    css: {
      ".preview, .page-container": {
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        overflow: "hidden",
      },
      ".page-container": {
        backgroundImage: `url(${IconLoading})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center center",
        backgroundSize: "96px",
      },
    },
    className: "preview",
    children: [
      {
        tag: "iframe",
        className: "page-container",
        attrs: {
          frameborder: 0,
        },
        mounted,
      },
    ],
  };
}
