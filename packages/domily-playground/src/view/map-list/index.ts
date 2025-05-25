import { reactive, ref } from "domily";

export default function MapList() {
  const data = ref<string[]>([]);
  const key = ref(0);
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
    data.value = json.data;
    style.color = "red";
  };

  return {
    key: () => `container-${key.value}`,
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
            data.value.shift();
            data.value = [...data.value];
          },
        },
      },
      {
        tag: "button",
        text: "unshift",
        style: "cursor: pointer",
        on: {
          click: () => {
            data.value.unshift(
              (Math.random() * 5000).toFixed(0) + "-" + Date.now()
            );
            data.value = [...data.value];
          },
        },
      },
      {
        tag: "button",
        text: "pop",
        style: "cursor: pointer",
        on: {
          click: () => {
            data.value.pop();
            data.value = [...data.value];
          },
        },
      },
      {
        tag: "button",
        text: "push",
        style: "cursor: pointer",
        on: {
          click: () => {
            data.value.push(
              (Math.random() * 5000).toFixed(0) + "-" + Date.now()
            );
            data.value = [...data.value];
          },
        },
      },
      {
        tag: "button",
        text: () => `change Key: ${key.value}`,
        style: "cursor: pointer",
        on: {
          click: () => {
            nonReactiveObjStyle.color = "#ff00f3";
            key.value++;
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
      list: () => data.value,
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
