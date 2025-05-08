import Header from '../../components/header.d.md';

export default function Layout() {
  return {
    tag: 'div',
    className: 'layout',
    children: [
      Header(),
      {
        tag: 'router-view',
      },
    ],
  };
}
