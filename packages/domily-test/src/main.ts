import { createDomily } from '@domily/runtime-core';

import App from './app';
import router from './routers';
import './css.css';

const { app, mount } = createDomily().app({
  app: App,
});

app.use(router);

mount();
