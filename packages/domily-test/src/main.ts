import { createApp } from "@domily/runtime-core";

import App from "./app";
import router from "./routers";
import "./css.css";

const { app, mount } = createApp(App);

app.use(router);

mount();
