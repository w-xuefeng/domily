import { createApp } from "@domily/runtime-core";

import App from "./app";
import router from "./routers";
import "./css.less";

const { app, mount } = createApp(App);

app.use(router);

mount();
