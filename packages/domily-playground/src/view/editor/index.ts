import { computed, render, type ISignalFunc } from "domily";
import useTheme from "@/store/theme";
import * as monaco from "monaco-editor";
import "./use-worker";

export default function Editor(props: { code: ISignalFunc<string> }) {
  const themeStore = useTheme((_, themeDetail) => {
    if (themeDetail === "dark") {
      monaco.editor.setTheme("vs-dark");
    }
    if (themeDetail === "light") {
      monaco.editor.setTheme("default");
    }
  });

  const editorInitialTheme = computed(() => {
    if (themeStore.theme === "dark") {
      return "vs-dark";
    }
    if (themeStore.theme === "light") {
      return "default";
    }
    if (themeStore.theme === "auto") {
      const matchMedia = window.matchMedia("(prefers-color-scheme: light)");
      return matchMedia.matches ? "default" : "vs-dark";
    }
    return "default";
  });

  let editor: monaco.editor.IStandaloneCodeEditor;

  let contentChangeTimer;

  const mounted = (dom: HTMLElement | null) => {
    const editorDOM = dom?.querySelector<HTMLElement>(".editor");
    if (!editorDOM) {
      return;
    }
    editor = monaco.editor.create(editorDOM, {
      value: props.code(),
      language: "javascript",
      theme: editorInitialTheme.value,
      automaticLayout: true,
    });

    const model = editor.getModel();
    const readOnlyRange = new monaco.Range(1, 1, 5, model.getLineMaxColumn(5));

    model.deltaDecorations(
      [],
      [
        {
          range: readOnlyRange,
          options: {
            isWholeLine: true,
            className: "read-only-line",
            hoverMessage: { value: "此行为只读区域" },
            inlineClassName: "no-edit",
            stickiness:
              monaco.editor.TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges,
          },
        },
      ]
    );
    editor.getModel().onDidChangeContent(() => {
      clearTimeout(contentChangeTimer);
      contentChangeTimer = setTimeout(() => {
        props.code(editor.getValue());
      }, 1000);
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, async () => {
      await editor.getAction("editor.action.formatDocument").run();
      props.code(editor.getValue());
    });
  };

  const unmounted = () => {
    if (!editor) {
      return;
    }
    editor.dispose();
  };

  return render({
    tag: "section",
    customElement: {
      enable: true,
      name: "code-editor",
      css: {
        ".editor": {
          width: "100%",
          height: "100%",
          ".read-only-line": {
            backgroundColor: "var(--read-only-background)",
            pointerEvents: "none",
            cursor: "not-allowed",
          },
          ".no-edit": {
            cursor: "not-allowed",
          },
        },
      },
    },
    className: "editor",
    mounted,
    unmounted,
  });
}
