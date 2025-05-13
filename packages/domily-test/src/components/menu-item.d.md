```json
{
  "tag": "div",
  "className": "menu-item",
  "text": ":props.title",
  "on": {
    "click": "@menuClick"
  },
  "mounted": ":mounted",
  "unmounted": ":unmounted",
}
```

```ts
import { useRouter } from '@domily/router'

const router = useRouter()
const menuClick = () => {
  router.push(props.path);
}

const mounted = (menuItem) => {
  console.log('menu-item mounted', menuItem)
}
const unmounted = () => {
  console.log('menu-item unmounted')
}

```
