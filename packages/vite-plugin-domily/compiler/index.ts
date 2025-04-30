import { transform } from "@swc/core";
import type { VitePluginDomilyOptions } from "./utils";
type Mode = "dev" | "build" | "unknown";

function parse(code: string) {
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)\n```/g;

  const result = {
    script: "",
    json: "",
    style: "",
    ts: false,
    cssPreprocessor: "css",
  };

  let match: RegExpExecArray | null = null;

  while ((match = codeBlockRegex.exec(code)) !== null) {
    const [_, lang, content] = match;
    const langLowerCase = lang.toLowerCase();
    switch (langLowerCase) {
      case "json":
        result.json = content;
        break;
      case "ts":
      case "typescript":
        result.ts = true;
        result.script = content;
        break;
      case "js":
      case "javascript":
        result.script = content;
        break;
      case "less":
      case "css":
      case "scss":
      case "sass":
        result.cssPreprocessor = langLowerCase;
        result.style = content;
        break;
      default:
        if (content.trim().startsWith("{")) {
          result.json = content;
        } else if (/(const|let|function)\s/.test(content)) {
          result.script = content;
        } else if (/(\.|#)[\w-]+\s*{/.test(content)) {
          result.style = content;
        }
    }
  }
  return result;
}

function handleScript(
  code: {
    script: string;
    json: string;
    style: string;
    ts: boolean;
    cssPreprocessor: string;
  },
  mode: Mode
) {
  code.json = code.json.replaceAll(/"@(?<event>\w+)"/g, (_, match) => {
    return match;
  });
  return code;
}

async function handleStyle(
  code: {
    script: string;
    json: string;
    style: string;
    ts: boolean;
    cssPreprocessor: string;
  },
  mode: Mode
) {
  if (code.cssPreprocessor === "css") {
    return code;
  }
  if (code.cssPreprocessor === "less") {
    const less = await import("less").then((e) => e.default);
    const { css } = await less.render(code.style, { compress: mode !== "dev" });
    code.style = css;
  }
  if (["scss", "sass"].includes(code.cssPreprocessor)) {
    const sass = await import("sass").then((e) => e);
    const { css } = sass.compileString(code.style, {
      syntax: code.cssPreprocessor === "scss" ? "scss" : "indented",
      style: mode === "dev" ? "expanded" : "compressed",
    });
    code.style = css;
  }
  return code;
}

function handleTemplateStyle(json: string, style: string) {
  const template = style.trim()
    ? `{
        tag: 'fragment',
        children: [
          {
            tag: 'style',
            children: [
              {
                tag: 'text',
                text: \`${style}\`
              }
            ]
          },
          ${json}
        ]
      }`
    : json;
  return template;
}

function generateCodeText({
  name,
  script,
  template,
  options,
}: {
  name: string;
  script: string;
  template: string;
  options: VitePluginDomilyOptions;
}) {
  const {
    customElement: { enable, prefix },
  } = options;

  const result = enable
    ? `{ name: "${prefix}${name}", customElementComponent: ${template}}`
    : template;

  const codeText = `export default () => {
    ${script}
    return ${result}
  }`;

  return codeText;
}

export async function transformDOMSingleFileComponentCode(
  name: string,
  code: string,
  mode: "dev" | "build" | "unknown",
  options: VitePluginDomilyOptions
) {
  const { script, style, json, ts } = await handleStyle(
    handleScript(parse(code), mode),
    mode
  );
  const template = handleTemplateStyle(json, style);

  const codeText = generateCodeText({
    name,
    script,
    template,
    options,
  });

  const result = await transform(codeText, {
    jsc: {
      parser: {
        syntax: ts ? "typescript" : "ecmascript",
        tsx: true,
        decorators: true,
      },
      target: "es2022",
    },
    minify: mode !== "dev",
    sourceMaps: mode === "dev",
  });
  return { code: result.code, map: result.map };
}
