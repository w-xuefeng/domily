import { signal } from "domily";
import Header from "../../components/header.d.md";
import Editor from "../editor";
import Preview from "../preview";

export default function Layout() {
  const initialCode = `<style>
  body {
    margin: 0;
  }
</style>

<div id="app"></div>

<script type="module">
  import { signal, render } from 'https://cdn.jsdelivr.net/npm/@domily/runtime-core/lib/index.esm.js';

  function App() {
    const count = signal(0);
    const css = {
      ".domily-example": {
        width: "100%",
        height: "100%",
        display: "flex",
        gap: "10px",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#191919",
        color: "#ffffff",
        ".logo": {
          height: "100px",
          animationName: "scale",
          animationDuration: "2s",
          animationPlayState: "running",
          animationIterationCount: "infinite",
          animationTimingFunction: "linear",
          "&:hover": {
            animationPlayState: "paused",
          },
        },
        button: {
          boxSizing: "border-box",
          cursor: "pointer",
          color: "#aac8e4",
          backgroundColor: "#2f2f2f",
          background: "linear-gradient(#2f2f2f, #2f2f2f) padding-box, linear-gradient(45deg, #fff500, #00e1ff) border-box",
          border: "2px solid transparent",
          fontSize: "16px",
          padding: "8px 18px",
          fontWeight: 500,
          borderRadius: "8px",
        },
      },
      "@keyframes scale": {
        "100%": {
          transform: "scale(1.2)"
        },
      }
    };
    return {
      tag: "fragment",
      customElement: {
        enable: true,
        name: "domily-counter-example",
        useShadowDOM: true,
        shadowDOMMode: "open",
        css,
      },
      className: "domily-example",
      children: [
        {
          tag: "img",
          className: "logo",
          props: {
            src: "https://raw.githubusercontent.com/w-xuefeng/domily/main/assets/logo.webp"
          }
        },
        {
          tag: "button",
          text: "Increment",
          on: {
            click: () => count(count() + 1),
          },
        },
        {
          tag: "p",
          text: () => "Count:" + count(),
        },
      ],
    };
  }

  render(App()).mount("#app");
</script>`;

  const code = signal(initialCode);

  const openInNewWindow = () => {
    const htmlFile = new Blob([code()], { type: "text/html" });
    const url = URL.createObjectURL(htmlFile);
    const win = window.open(url);
    win.onclose = () => {
      URL.revokeObjectURL(url);
    };
  };

  const mainMounted = () => {
    document.querySelector("#global-loading")?.remove();
  };

  return {
    tag: "div",
    css: {
      ".layout": {
        width: "100%",
        height: "100%",
      },
      ".main-container": {
        display: "flex",
        height: "calc(100% - var(--header-height))",
        "code-editor, preview-browser": {
          width: "50%",
        },
      },
    },
    className: "layout",
    children: [
      Header({
        openInNewWindow,
      }),
      {
        tag: "main",
        className: "main-container",
        children: [Editor({ code }), Preview({ code })],
        mounted: mainMounted,
      },
    ],
  };
}
