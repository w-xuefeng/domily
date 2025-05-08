```json
{
  "tag": "header",
  "className": "header",
  "children": [
    {
      "tag": "img",
      "className": "logo",
      "props": {
        "src": ":Logo"
      }
    },
    ":Menu()"
  ]
}
```

```ts
import Menu from './menu.d.md';
import Logo from '../assets/imgs/logo.svg';
const handleClick = (e: Event) => {
  console.log('click', e)
};
```

```less
.header {
  width: 100%;
  height: 60px;
  background-color: #fff;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  padding: 10px 20px;
  .logo {
    width: 100px;
    font-size: 20px;
    color: rgb(0, 109, 206);
  }
}
```
