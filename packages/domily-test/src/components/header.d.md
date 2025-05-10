```json
{
  "tag": "header",
  "className": "header",
  "children": [
    {
      "tag": "img",
      "className": "logo",
      "domIf": "@logoIf",
      "props": {
        "src": ":Logo"
      }
    },
    {
      "tag": "button",
      "text": "Toggle Logo",
      "on": {
        "click": "@handleClick"
      }
    },
    ":Menu()"
  ]
}
```

```ts
import Menu from './menu.d.md';
import Logo from '../assets/imgs/logo.svg';
import { ref, cr } from "@domily/runtime-core";

const showLogo = ref(true);
const logoIf = cr(() => showLogo.value)

const handleClick = (e: Event) => {
  console.log('click', e)
  showLogo.value = !showLogo.value
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
