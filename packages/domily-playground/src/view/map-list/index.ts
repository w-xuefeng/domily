import { reactive } from "domily";

export default function MapList() {
  const state = reactive<{ data: string[]; key: number }>({
    data: [],
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
    const rs = await fetch("https://api.pearktrue.cn/api/countdownday/");
    const json = await rs.json();
    state.data = json.data;
    console.log("data", state.data);
    style.color = "red";
  };

  return {
    key: () => `container-${state.key}`,
    tag: "ul",
    className: "test-page",
    mounted,
    style,
    children: [
      {
        tag: "button",
        text: "Click Me",
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
            state.data.shift();
          },
        },
      },
      {
        tag: "button",
        text: "unshift",
        style: "cursor: pointer",
        on: {
          click: () => {
            state.data.unshift(
              (Math.random() * 5000).toFixed(0) + "-" + Date.now()
            );
          },
        },
      },
      {
        tag: "button",
        text: "pop",
        style: "cursor: pointer",
        on: {
          click: () => {
            state.data.pop();
          },
        },
      },
      {
        tag: "button",
        text: "push",
        style: "cursor: pointer",
        on: {
          click: () => {
            state.data.push(
              (Math.random() * 5000).toFixed(0) + "-" + Date.now()
            );
          },
        },
      },
      {
        tag: "button",
        text: () => `change Key: ${state.key}`,
        style: "cursor: pointer",
        on: {
          click: () => {
            nonReactiveObjStyle.color = "#ff00f3";
            state.key++;
          },
        },
      },
      {
        tag: "div",
        text: "非响应式对象更新测试内容",
        style: nonReactiveObjStyle,
      },
    ],
    mapList: {
      list: () => state.data,
      map: (item: string, index: number) => {
        return {
          tag: "li",
          key: `list-${index}`,
          text: item,
        };
      },
    },
  };
}
