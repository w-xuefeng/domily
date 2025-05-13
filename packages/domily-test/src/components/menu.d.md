```json
{
  "tag": "div",
  "className": "menu",
  "mapList": {
    "list": ":menus",
    "map": ":menuItem"
  },
  "mounted": ":mounted",
  "unmounted": ":unmounted",
}
```

```ts
import menuItem from './menu-item.d.md';
const menus = [
  {
    title: '首页',
    path: '/'
  },
  {
    title: '列表',
    path: '/home'
  },
  {
    title: '详情',
    path: '/home/details'
  }
]


const mounted = (menu) => {
  console.log('menu mounted', menu)
}
const unmounted = () => {
  console.log('menu unmounted')
}

```

```scss
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
      background-color: hsl(from var(--menu-item-background) h s calc(l - 10));
    }
  }
}
```
