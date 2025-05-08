```json
{
  "tag": "div",
  "className": "menu",
  "mapList": {
    "list": ":menus",
    "map": "@itemRender"
  }
}
```

```ts
const handleClick = (item: number) => {
  console.log("🚀 ~ handleClick ~ item:", item)
};
const menuClick = (item: string) => {
  return handleClick.bind(null, item);
};
const menus = [
  {
    title: '首页',
  },
  {
    title: '列表',
  },
  {
    title: '详情',
  }
]
const itemRender = (menu) => {
  return {
    tag: 'div',
    className: 'menu-item',
    text: menu.title,
    on: {
      click: menuClick(menu)
    }
  }
}
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
