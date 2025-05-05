import { createDomily } from '@domily/runtime-core';

import App from './app';
import router from './routers';
import './css.css';

const namespace = 'domily';

const Domily = createDomily();

const { app, mount } = Domily.app({
  namespace,
  app: App,
});

app.use(router);

mount();
