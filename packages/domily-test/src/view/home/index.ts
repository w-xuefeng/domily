import { useRouter } from '@domily/router';
import { Domily, type WithBaseProps } from '@domily/runtime-core';

export default function Home({ namespace }: WithBaseProps) {
  const router = useRouter(namespace);

  const goDetails = () => {
    router.push({ name: 'home-details' });
  };

  return Domily.div({
    className: 'home-page',
    children: [
      Domily.div({
        children: [
          Domily.button({
            text: 'GO Details',
            on: {
              click: goDetails,
            },
          }),
        ],
      }),
      Domily['router-view'](),
    ],
  });
}
