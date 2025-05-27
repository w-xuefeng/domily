import { computed, reactive } from "domily";

export default function MapList() {
  const state = reactive<{
    loading: boolean;
    data: {
      map: Map<string, any>;
      array: string[];
      set: Set<string>;
    };
    key: number;
  }>({
    loading: false,
    data: {
      map: new Map(),
      array: [],
      set: new Set(),
    },
    key: 0,
  });
  const mounted = () => {
    document.querySelector("#global-loading")?.remove();
  };

  const nonReactiveObjStyle = {
    color: "blue",
  };

  const style = reactive({
    color: "green",
  });

  const getData = async () => {
    state.loading = true;
    try {
      const rs = await fetch("https://api.pearktrue.cn/api/countdownday/");
      const json = (await rs.json()) as { data: string[] };
      style.color = "red";
      state.data.map = new Map(
        json.data.map((item, index) => [`${index}`, item])
      );
      state.data.set = new Set(json.data);
      state.data.array = json.data;
    } finally {
      state.loading = false;
    }
  };

  const mapText = computed(() => {
    if (state.loading) {
      return "Loading...";
    }
    const data = Array.from(state.data.map.values());
    return JSON.stringify(data, null, 2);
  });

  const setText = () => {
    if (state.loading) {
      return "Loading...";
    }
    const data = Array.from(state.data.set.values());
    return JSON.stringify(data, null, 2);
  };

  return {
    key: () => `container-${state.key}`,
    tag: "fragment",
    className: "test-page",
    css: {
      ".test-page": {
        margin: "20px",
      },
    },
    mounted,
    style,
    children: [
      {
        tag: "button",
        text: "Get Data",
        style: "cursor: pointer",
        on: {
          click: () => {
            getData();
          },
        },
      },
      {
        tag: "button",
        text: "shift",
        style: "cursor: pointer",
        on: {
          click: () => {
            state.data.array.shift();
            state.data.map = new Map(
              state.data.array.map((item, index) => [`${index}`, item])
            );
            state.data.set = new Set(state.data.array);
          },
        },
      },
      {
        tag: "button",
        text: "unshift",
        style: "cursor: pointer",
        on: {
          click: () => {
            const value = (Math.random() * 5000).toFixed(0) + "-" + Date.now();
            state.data.array.unshift(value);
            state.data.map = new Map(
              state.data.array.map((item, index) => [`${index}`, item])
            );
            state.data.set = new Set(state.data.array);
          },
        },
      },
      {
        tag: "button",
        text: "pop",
        style: "cursor: pointer",
        on: {
          click: () => {
            state.data.map.delete(`${state.data.array.length - 1}`);
            const popData = state.data.array.pop();
            state.data.set.delete(popData);
          },
        },
      },
      {
        tag: "button",
        text: "push",
        style: "cursor: pointer",
        on: {
          click: () => {
            const value = (Math.random() * 5000).toFixed(0) + "-" + Date.now();
            state.data.array.push(value);
            state.data.map.set(`${state.data.array.length - 1}`, value);
            state.data.set.add(value);
          },
        },
      },
      {
        tag: "button",
        text: () => `change Key: ${state.key}`,
        style: "cursor: pointer",
        on: {
          click: () => {
            nonReactiveObjStyle.color = [
              "#ff00f3",
              "#00f3ff",
              "#f3ff00",
              "#f300ff",
              "#00f300",
              "#ff0000",
              "#0000ff",
              "#00ff00",
              "#ff00ff",
              "#00ffff",
            ][Math.floor(Math.random() * 10)];
            state.key++;
          },
        },
      },
      {
        tag: "div",
        text: "非响应式对象更新测试内容",
        style: nonReactiveObjStyle,
      },
      {
        tag: "div",
        style: "display: flex; gap: 10px;",
        children: [
          {
            tag: "div",
            style:
              "width: 500px; height: 500px; overflow: auto; border: 1px solid #ccc;",
            children: [
              {
                tag: "h3",
                text: "Map Data",
              },
              {
                tag: "div",
                style:
                  'white-space: pre-wrap; font-family: "Courier New", Courier, monospace;',
                text: mapText,
              },
            ],
          },
          {
            tag: "div",
            style:
              "width: 500px; height: 500px; overflow: auto; border: 1px solid #ccc;",
            children: [
              {
                tag: "h3",
                text: "Set Data",
              },
              {
                tag: "div",
                style:
                  'white-space: pre-wrap; font-family: "Courier New", Courier, monospace;',
                text: setText,
              },
            ],
          },
          {
            tag: "div",
            style:
              "width: 500px; height: 500px; overflow: auto; border: 1px solid #ccc;",
            children: [
              {
                tag: "h3",
                text: "Array Data",
              },
              {
                tag: "div",
                domIf: () => state.loading,
                text: "Loading...",
              },
              {
                tag: "ul",
                domIf: () => !state.loading,
                mapList: {
                  list: () => state.data.array,
                  map: (item: string, index: number) => {
                    return {
                      tag: "li",
                      key: `list-${index}`,
                      text: item,
                    };
                  },
                },
              },
            ],
          },
        ],
      },
    ],
  };
}
