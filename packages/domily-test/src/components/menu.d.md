```json
{
  "tag": "div",
  "className": "menu",
  "children": [
    {
      "tag": "div",
      "className": "menu-item",
      "text": "菜单1",
      "on": {
        "click": "@menuClick(1)"
      }
    },
    {
      "tag": "div",
      "className": "menu-item",
      "text": "菜单2",
      "on": {
        "click": "@menuClick(2)"
      }
    },
    {
      "tag": "div",
      "className": "menu-item",
      "text": "菜单3",
      "on": {
        "click": "@menuClick(3)"
      }
    },
    {
      "tag": "div",
      "className": "menu-item",
      "text": "菜单4",
      "on": {
        "click": "@menuClick(4)"
      }
    }
  ]
}
```

```ts
const handleClick = (e: Event, item: number) => {
  console.log("🚀 ~ handleClick ~ item:", item)
  console.log("🚀 ~ handleClick ~ event", e);
};
const menuClick = (item: string) => {
  return handleClick.bind(null, item);
};
```

```less
.menu {
  width: 100%;
  height: 100%;
  display: flex;
  gap: 10px;
  align-items: center;
  --menu-item-background: #fff;
  .menu-item {
    width: 100px;
    box-sizing: border-box;
    padding: 10px 20px;
    background-color: var(--menu-item-background);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover {
      background-color: hsl(from var(--menu-item-background) h s calc(l - 20));
    }
  }
}
```
