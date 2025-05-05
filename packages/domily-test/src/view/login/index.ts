import { Domily } from '@domily/runtime-core';

const { div, h1, button } = Domily;

export default function Login() {
  return div({
    className: 'login',
    children: [
      h1({
        text: 'Login Page',
      }),
      button({
        text: 'Login',
        on: {
          click: () => {
            console.log('🚀 ~ Login ~ location.search:', location.search);
            const p = new URLSearchParams(location.search);
            const r = p.get('redirect');
            if (r) {
              console.log('🚀 ~ Login ~ r:', r);
              localStorage.setItem('token', '123');
              // @ts-ignore
              $P.domily.$router.push({ path: r });
            }
          },
        },
      }),
    ],
  });
}
