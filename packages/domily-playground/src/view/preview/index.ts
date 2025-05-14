import { render } from "@domily/runtime-core";

export default function Preview() {
  return render({
    tag: "section",
    customElement: {
      enable: true,
      name: "preview-browser",
      useShadowDOM: true,
      shadowDOMMode: "open",
    },
    css: {
      ".preview": {
        width: "100%",
        height: "100%",
        overflow: "auto",
      },
    },
    className: "preview",
    children: [],
  });
}
