import { Domily } from '@domily/runtime-core';
import Header from '../../components/header.d.md';

export default function Layout() {
  return Domily.div({
    className: 'layout',
    children: [Header(), Domily['router-view']()],
  });
}
