import { useRoute } from '@domily/router';
import { Domily } from '@domily/runtime-core';

export default function HomeDetails({ namespace }) {
  const route = useRoute(namespace);
  console.log('🚀 ~ HomeDetails ~ route.query:', route.query);
  console.log('🚀 ~ HomeDetails ~ route.params:', route.params);
  return Domily.div({
    className: 'home-details-params-page',
    children: ['home-params-details'],
  });
}
