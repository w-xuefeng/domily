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
    {
      "tag": "h1",
      "className": "title",
      "text": "Playground"
    },
    {
      "tag": "fragment",
      "className": "switch-theme-container",
      "children": [
        {
          "tag": "img",
          "className": "theme-icon",
          "props": {
            "src": "@icon"
          }
        },
        {
          "tag": "select",
          "className": "switch-theme",
          "props": {
            "value": ":store.theme"
          },
          "on": {
            "change": "@onThemeChange"
          },
          "children": [
            {
              "tag": "option",
              "className": "switch-theme-option",
              "props": {
                "value": "auto"
              },
              "text": "auto"
            },
            {
              "tag": "option",
              "className": "switch-theme-option",
              "props": {
                "value": "light"
              },
              "text": "light"
            },
            {
              "tag": "option",
              "className": "switch-theme-option",
              "props": {
                "value": "dark"
              },
              "text": "dark"
            }
          ]
        }
      ]
    }
  ]
}
```

```ts
import { cr, signal } from "domily";
import Logo from "@/assets/imgs/logo.webp";
import useTheme from "@/store/theme";
import IconSun from "@/assets/imgs/sun.svg";
import IconMoon from "@/assets/imgs/moon.svg";
import IconSystemDark from "@/assets/imgs/system-dark.svg";
import IconSystemLight from "@/assets/imgs/system-light.svg";

const autoThemeDetail = signal("light");

const store = useTheme((_, details) => {
  autoThemeDetail(details);
});

const icon = cr(() => {
  if (store.theme === "light") {
    return IconSun;
  }
  if (store.theme === "dark") {
    return IconMoon;
  }
  if (store.theme === "auto") {
    return autoThemeDetail() === "light" ? IconSystemLight : IconSystemDark;
  }
});

const onThemeChange = (e) => {
  store.theme = e.target.value;
};
```

```less
.header {
  width: 100%;
  height: var(--header-height);
  background-color: var(--header-background-color);
  display: flex;
  align-items: center;
  box-sizing: border-box;
  padding: 2px 20px;
  border-block-end: 1px solid var(--border-color);

  .logo {
    height: 100%;
    margin-inline-end: 10px;
  }

  .title {
    color: var(--text-color);
    margin: 0;
  }

  .switch-theme-container {
    color: var(--text-color);
    margin-inline-start: auto;
    display: flex;
    align-items: center;
    gap: 10px;

    .theme-icon {
      width: 30px;
      height: 30px;
    }
    .switch-theme {
      cursor: pointer;
      width: 55px;
      height: 30px;
      outline: none;
      background: var(--switch-theme-background-color);
      color: var(--text-color);
      border-radius: 4px;
    }
  }
}
```
