```json
{
  "tag": "div",
  "className": "menu-item",
  "text": ":props.title",
  "on": {
    "click": "@menuClick"
  }
}
```

```ts
import { useRouter } from '@domily/router'

const router = useRouter()
const menuClick = () => {
  router.push(props.path);
}
```
