import {
  parseSync,
  printSync,
  transform,
  type JscConfig,
  type ModuleItem,
} from "@swc/core";
import type { VitePluginDomilyOptions } from "./utils";
type Mode = "dev" | "build" | "unknown";

function filterCode(
  code: string,
  filter: (node: ModuleItem) => boolean,
  options: {
    ts?: boolean;
    mode?: Mode;
  }
) {
  const ast = parseSync(code, {
    syntax: options.ts ? "typescript" : "ecmascript",
  });
  const filteredAst = {
    ...ast,
    body: ast.body.filter(filter),
  };
  return printSync(filteredAst, { minify: options.mode !== "dev" }).code;
}

function JSC(ts: boolean) {
  const jsc: JscConfig = {
    parser: {
      syntax: ts ? "typescript" : "ecmascript",
      tsx: true,
      decorators: true,
    },
    target: "es2022",
    minify: {
      format: {
        indentLevel: 2,
      },
    },
  };
  return jsc;
}

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

function handleScript(code: {
  script: string;
  json: string;
  style: string;
  ts: boolean;
  cssPreprocessor: string;
}) {
  code.json = code.json
    .replaceAll(/"@(?<event>\w+\(?[\w,?]*\)?)"/g, (_, match) => {
      return match;
    })
    .replaceAll(/":(?<bind>\w+\(?[\w,?]*\)?)"/g, (_, match) => {
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

async function generateCodeText({
  name,
  script,
  template,
  options,
  ts,
  mode,
}: {
  name: string;
  script: string;
  template: string;
  options: VitePluginDomilyOptions;
  ts: boolean;
  mode: Mode;
}) {
  const {
    customElement: { enable, prefix },
  } = options;

  const returnTemplate = enable
    ? `{ name: "${prefix}${name}", customElementComponent: ${template}}`
    : template;
  const imports = filterCode(script, (n) => n.type === "ImportDeclaration", {
    ts,
    mode,
  });
  const others = filterCode(script, (n) => n.type !== "ImportDeclaration", {
    ts,
    mode,
  });
  return `${imports}export default function(){${others}return ${returnTemplate}}`;
}

export async function transformDOMSingleFileComponentCode(
  name: string,
  code: string,
  mode: Mode,
  options: VitePluginDomilyOptions
) {
  const { script, style, json, ts } = await handleStyle(
    handleScript(parse(code)),
    mode
  );
  const template = handleTemplateStyle(json, style);

  const codeText = await generateCodeText({
    name,
    script,
    template,
    options,
    ts,
    mode,
  });

  const result = await transform(codeText, {
    jsc: JSC(ts),
    minify: mode !== "dev",
    sourceMaps: mode === "dev",
  });
  return { code: result.code, map: result.map };
}
