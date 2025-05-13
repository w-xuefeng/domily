# @domily/runtime-core

`@domily/runtime-core` is the core runtime library of the `Domily` framework,
providing the basic tools and functionalities for building dynamic UI. It
supports responsive data binding, component-based development, and flexible DOM
operations

- **Responsive System**: Implementing responsive data binding through `signal`
  and `computed`.
- **Component based development**: Supports custom components.

## Install

Install using `npm` or `bun`:

```bash
npm install @domily/runtime-core
```

or

```bash
bun add @domily/runtime-core
```

## Quick start

Here is a simple example showing how to create a responsive application using
`@domily/runtime-core`:

```ts
import { createApp, signal } from "@domily/runtime-core";

const Counter = () => {
  const count = signal(0);

  return {
    tag: "div",
    children: [
      {
        tag: "button",
        text: "Increment",
        on: {
          click: () => count(count() + 1),
        },
      },
      {
        tag: "p",
        text: () => `Count: ${count()}`,
      },
    ],
  };
};

const { mount } = createApp(Counter);
mount("#app");
```

Alternatively, you can use the `UMD` version directly in your browser

```html
<!DOCTYPE html>
<html lang="">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body {
        margin: 0;
      }
    </style>
    <title>domily example</title>
  </head>

  <body>
    <div id="app"></div>
    <script src="https://cdn.jsdelivr.net/npm/@domily/runtime-core/lib/index.umd.js"></script>
    <script>
      const { render, signal } = DOMily;
      const count = signal(0);

      const css = {
        ".domily-example": {
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "#191919",
          color: "#ffffff",
          button: {
            boxSizing: "border-box",
            cursor: "pointer",
            color: "#aac8e4",
            backgroundColor: "#2f2f2f",
            background:
              "linear-gradient(#2f2f2f, #2f2f2f) padding-box, linear-gradient(45deg, #fff500, #00e1ff) border-box",
            border: "2px solid transparent",
            fontSize: "16px",
            padding: "8px 18px",
            fontWeight: 500,
            borderRadius: "8px",
            transition: "background-color .5s, color .5s",
          },
        },
      };

      render({
        tag: "fragment",
        customElement: {
          enable: true,
          name: "domily-counter-example",
          useShadowDOM: true,
          shadowDOMMode: "open",
        },
        css,
        className: "domily-example",
        children: [
          {
            tag: "button",
            text: "Increment",
            on: {
              click: () => count(count() + 1),
            },
          },
          {
            tag: "p",
            text: () => `Count: ${count()}`,
          },
        ],
      }).mount("#app");
    </script>
  </body>
</html>
```

## Core API

- `createApp`

```ts
function createApp<
  GlobalProperties extends Record<string, any> = Record<string, any>,
  AppProps extends Record<string, any> = Record<string, any>,
>(
  render: DOMilyAppParamsRender<AppProps>,
  options?: DomilyAppOptions<GlobalProperties>,
  appProps?: AppProps,
): {
  app: DomilyApp<GlobalProperties, AppProps>;
  mount(
    parent?: HTMLElement | Document | ShadowRoot | string,
  ): (() => void) | null;
};
```

- `render`

```ts
function render<K extends DOMilyTags, ListData = any>(
  schema: IDomilyRenderOptions<{}, K, ListData>,
): {
  schema: DomilyRenderSchema<any, any, any>;
  unmount: () => void;
  mount: (parent?: HTMLElement | Document | ShadowRoot | string) => void;
};

interface IDomilyRenderOptions<
  CustomElementMap = {},
  K extends DOMilyTags<CustomElementMap> = DOMilyTags,
  ListData = any,
> {
  /**
   * base info
   */
  tag: K;
  id?: WithFuncType<string>;
  className?: WithFuncType<string>;

  /**
   * style info
   */
  css?: WithFuncType<string | DOMilyCascadingStyleSheets>;
  style?: WithFuncType<string | Partial<CSSStyleDeclaration>>;

  /**
   * properties and attributes
   */
  props?: WithFuncType<DOMilyRenderOptionsPropsOrAttrs<CustomElementMap, K>>;
  attrs?: WithFuncType<DOMilyRenderOptionsPropsOrAttrs<CustomElementMap, K>>;

  /**
   * content and children
   */
  text?: WithFuncType<string | number>;
  html?: WithFuncType<string>;
  children?: DOMilyChildren;

  /**
   * eventListeners
   */
  on?: DOMilyEventListenerRecord<DOMilyEventKeys>;

  /**
   * display controller
   */
  domIf?: WithFuncType<boolean>;
  domShow?: WithFuncType<boolean>;

  /**
   * list-map
   */
  mapList?: {
    list: ListData[];
    map: (data: ListData, index: number) => DOMilyChild | DOMilyChildDOM;
  };

  /**
   * custom element
   */
  customElement?: IDomilyCustomElementOptions;

  /**
   * life cycle
   */
  mounted?: (dom: HTMLElement | Node | null) => void;
  unmounted?: () => void;
}
```

- `Domily`

```ts
type DOMily<CustomTagNameMap = {}> =
  & {
    [T in DOMilyTags<CustomTagNameMap>]: (
      schema?: Omit<IDomilyRenderOptions<CustomTagNameMap, T>, "tag">,
    ) => DOMilyMountableRender<CustomTagNameMap, T>;
  }
  & DOMilyBase<CustomTagNameMap>;

type DOMilyBase<CustomTagNameMap = {}> = {
  createApp: typeof createApp;
  render: typeof render;
  registerElement<T extends string>(
    tag: T,
    constructor?: CustomElementConstructor | undefined,
  ): DOMily<
    typeof constructor extends new (...args: any) => infer R
      ? CustomTagNameMap & { [key in T]: R }
      : CustomTagNameMap
  >;
};
```

Quick tag creation helper in the `Domily`:

```ts
import { Domily } from "@domily/runtime-core";

Domily.fragment({
  className: "example-container",
  children: [
    Domily.header({
      text: "this is the header",
    }),
    Domily.article({
      text: "this is the content",
    }),
    Domily.footer({ text: "this is the footer" }),
  ],
}).mount(document.body);
```

The final behavior of the above code and the following code is consistent:

```ts
import { render } from "@domily/runtime-core";

render({
  tag: 'fragment',
  className: "example-container",
  children: [
    {
      tag: "header",
      text: "this is the header",
    },
    {
      tag: "article",
      text: "this is the content",
    },
    {
      tag: "footer",
      text: "this is the footer",
    },
  ],
}).mount(document.body);
```

Other helper of quick-tag-creation like this include the following:

```ts
Domily.a(schema);
Domily.abbr(schema);
Domily.address(schema);
Domily.area(schema);
Domily.article(schema);
Domily.aside(schema);
Domily.audio(schema);
Domily.b(schema);
Domily.base(schema);
Domily.bdi(schema);
Domily.bdo(schema);
Domily.blockquote(schema);
Domily.body(schema);
Domily.br(schema);
Domily.button(schema);
Domily.canvas(schema);
Domily.caption(schema);
Domily.cite(schema);
Domily.code(schema);
Domily.col(schema);
Domily.colgroup(schema);
Domily.data(schema);
Domily.datalist(schema);
Domily.dd(schema);
Domily.del(schema);
Domily.details(schema);
Domily.dfn(schema);
Domily.dialog(schema);
Domily.div(schema);
Domily.dl(schema);
Domily.dt(schema);
Domily.em(schema);
Domily.embed(schema);
Domily.fieldset(schema);
Domily.figcaption(schema);
Domily.figure(schema);
Domily.footer(schema);
Domily.form(schema);
Domily.h1(schema);
Domily.h2(schema);
Domily.h3(schema);
Domily.h4(schema);
Domily.h5(schema);
Domily.h6(schema);
Domily.head(schema);
Domily.header(schema);
Domily.hgroup(schema);
Domily.hr(schema);
Domily.html(schema);
Domily.i(schema);
Domily.iframe(schema);
Domily.img(schema);
Domily.input(schema);
Domily.ins(schema);
Domily.kbd(schema);
Domily.label(schema);
Domily.legend(schema);
Domily.li(schema);
Domily.link(schema);
Domily.main(schema);
Domily.map(schema);
Domily.mark(schema);
Domily.menu(schema);
Domily.meta(schema);
Domily.meter(schema);
Domily.nav(schema);
Domily.noscript(schema);
Domily.object(schema);
Domily.ol(schema);
Domily.optgroup(schema);
Domily.option(schema);
Domily.output(schema);
Domily.p(schema);
Domily.picture(schema);
Domily.pre(schema);
Domily.progress(schema);
Domily.q(schema);
Domily.rp(schema);
Domily.rt(schema);
Domily.ruby(schema);
Domily.s(schema);
Domily.samp(schema);
Domily.script(schema);
Domily.search(schema);
Domily.section(schema);
Domily.select(schema);
Domily.slot(schema);
Domily.small(schema);
Domily.source(schema);
Domily.span(schema);
Domily.strong(schema);
Domily.style(schema);
Domily.sub(schema);
Domily.summary(schema);
Domily.sup(schema);
Domily.table(schema);
Domily.tbody(schema);
Domily.td(schema);
Domily.template(schema);
Domily.textarea(schema);
Domily.tfoot(schema);
Domily.th(schema);
Domily.thead(schema);
Domily.time(schema);
Domily.title(schema);
Domily.tr(schema);
Domily.track(schema);
Domily.u(schema);
Domily.ul(schema);
Domily.var(schema);
Domily.video(schema);
Domily.wbr(schema);
Domily["SVG:a"](schema);
Domily["SVG:animate"](schema);
Domily["SVG:animateMotion"](schema);
Domily["SVG:animateTransform"](schema);
Domily["SVG:circle"](schema);
Domily["SVG:clipPath"](schema);
Domily["SVG:defs"](schema);
Domily["SVG:desc"](schema);
Domily["SVG:ellipse"](schema);
Domily["SVG:feBlend"](schema);
Domily["SVG:feColorMatrix"](schema);
Domily["SVG:feComponentTransfer"](schema);
Domily["SVG:feComposite"](schema);
Domily["SVG:feConvolveMatrix"](schema);
Domily["SVG:feDiffuseLighting"](schema);
Domily["SVG:feDisplacementMap"](schema);
Domily["SVG:feDistantLight"](schema);
Domily["SVG:feDropShadow"](schema);
Domily["SVG:feFlood"](schema);
Domily["SVG:feFuncA"](schema);
Domily["SVG:feFuncB"](schema);
Domily["SVG:feFuncG"](schema);
Domily["SVG:feFuncR"](schema);
Domily["SVG:feGaussianBlur"](schema);
Domily["SVG:feImage"](schema);
Domily["SVG:feMerge"](schema);
Domily["SVG:feMergeNode"](schema);
Domily["SVG:feMorphology"](schema);
Domily["SVG:feOffset"](schema);
Domily["SVG:fePointLight"](schema);
Domily["SVG:feSpecularLighting"](schema);
Domily["SVG:feSpotLight"](schema);
Domily["SVG:feTile"](schema);
Domily["SVG:feTurbulence"](schema);
Domily["SVG:filter"](schema);
Domily["SVG:foreignObject"](schema);
Domily["SVG:g"](schema);
Domily["SVG:image"](schema);
Domily["SVG:line"](schema);
Domily["SVG:linearGradient"](schema);
Domily["SVG:marker"](schema);
Domily["SVG:mask"](schema);
Domily["SVG:metadata"](schema);
Domily["SVG:mpath"](schema);
Domily["SVG:path"](schema);
Domily["SVG:pattern"](schema);
Domily["SVG:polygon"](schema);
Domily["SVG:polyline"](schema);
Domily["SVG:radialGradient"](schema);
Domily["SVG:rect"](schema);
Domily["SVG:script"](schema);
Domily["SVG:set"](schema);
Domily["SVG:stop"](schema);
Domily["SVG:style"](schema);
Domily["SVG:svg"](schema);
Domily["SVG:switch"](schema);
Domily["SVG:symbol"](schema);
Domily["SVG:text"](schema);
Domily["SVG:textPath"](schema);
Domily["SVG:title"](schema);
Domily["SVG:tspan"](schema);
Domily["SVG:use"](schema);
Domily["SVG:view"](schema);
```

```ts
/**
 * create fragment
 */
Domily.fragment(schema);
/**
 * create Text Node
 */
Domily.text(schema);
/**
 * create Comment Node
 */
Domily.comment(schema);
```
