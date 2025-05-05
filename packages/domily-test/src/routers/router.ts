import { type IDomilyPageSchema } from '@domily/router';

export const routes: (namespace: string) => IDomilyPageSchema[] = (namespace: string) => [
  {
    namespace,
    name: 'index',
    path: '/',
    component: import('../view/layout'),
    meta: {
      authorize: [],
    },
    children: [
      {
        name: 'home',
        path: '/home',
        component: import('../view/home'),
        meta: {
          title: '主页',
          authorize: [],
        },
        children: [
          {
            name: 'home-details',
            path: '/home/details',
            component: import('../view/details'),
            meta: {
              title: '概况',
              authorize: [],
            },
            children: [
              {
                name: 'home-params-details',
                path: '/home/details/:id',
                meta: {
                  title: '详情',
                  authorize: [],
                },
                component: import('../view/details/params'),
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'login',
    path: '/login',
    meta: {
      title: '登录',
      authorize: [],
    },
    component: import('../view/login'),
  },
];
