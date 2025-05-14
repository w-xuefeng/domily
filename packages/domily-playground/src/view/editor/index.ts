import { computed, ref, render } from "@domily/runtime-core";
import useTheme from "@/store/theme";
import * as monaco from "monaco-editor";
import "./use-worker";

export default function Editor() {
  const code = ref("");

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

  const mounted = (dom: HTMLElement | null) => {
    const editorDOM = dom?.querySelector<HTMLElement>(".editor");
    if (!editorDOM) {
      return;
    }
    editor = monaco.editor.create(editorDOM, {
      value: code.value,
      language: "typescript",
      theme: editorInitialTheme.value,
      automaticLayout: true,
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
        },
      },
    },
    className: "editor",
    mounted,
    unmounted,
  });
}
