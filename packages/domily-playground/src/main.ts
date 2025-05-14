import { createApp } from "domily";
import { registerSW } from "virtual:pwa-register";
import App from "./app";
import router from "./routers";
import "./css.less";

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("检测到新版本，是否立即更新？")) updateSW();
  },
  onOfflineReady() {
    console.log("离线模式已就绪");
  },
});

const { app, mount } = createApp(App);

app.use(router);

mount("#app");
