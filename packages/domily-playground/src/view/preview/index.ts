import * as Domily from "domily";
import { cr, render } from "domily";
import type { ISignalFunc } from "domily";

export default function Preview(props: { code: ISignalFunc<string> }) {
  const page = cr(() => {
    try {
      const getCode = new Function(
        "Domily",
        [
          "try {",
          `const renderFunction = ${props.code()}`,
          `if(typeof renderFunction !== 'function') { throw TypeError('The code must be wrapped within a function scope')}`,
          `return renderFunction(Domily);`,
          "} catch {",
          `throw TypeError('The code must be wrapped within a function scope')`,
          "}",
        ].join("\n")
      );
      return getCode(Domily);
    } catch (error) {
      return render({
        tag: "div",
        className: "error",
        children: [
          {
            tag: "div",
            className: "message",
            text: `${error.name} ${error.message}`,
          },
          {
            tag: "div",
            className: "stack",
            text: error.stack,
          },
        ],
      });
    }
  });

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
        ".error": {
          color: "#f40",
          border: "2px solid #ff2600",
          width: "90%",
          margin: "10px auto",
          boxSizing: "border-box",
          borderRadius: "2px",
          backgroundColor: "#ff907c",
          padding: "10px",
          ".message": {
            color: "#fff",
            fontSize: "18px",
            marginBlockEnd: "10px",
          },
          ".stack": {
            paddingInlineStart: "40px",
            boxSizing: "border-box",
            color: "#fff",
            fontSize: "14px",
            whiteSpace: "pre-wrap",
          },
        },
      },
    },
    className: "preview",
    children: [page],
  });
}
