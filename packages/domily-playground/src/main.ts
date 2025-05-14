import { createApp } from "domily";

import App from "./app";
import router from "./routers";
import "./css.less";

const { app, mount } = createApp(App);

app.use(router);

mount();
