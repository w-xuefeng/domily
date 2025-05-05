import { Domily, type WithBaseProps } from '@domily/runtime-core';
import Header from '../../components/header.d.md';
import { useRouter } from '@domily/router';

export default function Layout({ namespace }: WithBaseProps) {
  const router = useRouter(namespace);

  const goHome = () => {
    router.push({ name: 'home' });
  };

  return Domily.div({
    className: 'layout',
    children: [
      Domily.div({
        children: [Header()],
        on: {
          click: goHome,
        },
      }),
      Domily['router-view'](),
    ],
  });
}
