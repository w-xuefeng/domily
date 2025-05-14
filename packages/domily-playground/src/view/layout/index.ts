import Header from "../../components/header.d.md";
import Editor from "../editor";
import Preview from "../preview";

export default function Layout() {
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
      Header(),
      {
        tag: "main",
        className: "main-container",
        children: [Editor(), Preview()],
      },
    ],
  };
}
