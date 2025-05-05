import { Domily, type WithBaseProps } from '@domily/runtime-core';

export default function App({ namespace }: WithBaseProps) {
  console.log('🚀 ~ App ~ namespace:', namespace);
  return Domily['router-view']();
}
