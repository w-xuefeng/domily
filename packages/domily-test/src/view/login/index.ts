import { useRouter } from '@domily/router';

export default function Login({ namespace }) {
  const router = useRouter(namespace);
  return {
    tag: 'div',
    className: 'login',
    children: [
      {
        tag: 'h1',
        text: 'Login Page',
      },
      {
        tag: 'button',
        text: 'Login',
        on: {
          click: () => {
            console.log('🚀 ~ Login ~ location.search:', location.search);
            const p = new URLSearchParams(location.search);
            const r = p.get('redirect');
            if (r) {
              console.log('🚀 ~ Login ~ r:', r);
              localStorage.setItem('token', '123');
              router.push({ path: r });
            }
          },
        },
      },
    ],
  };
}
