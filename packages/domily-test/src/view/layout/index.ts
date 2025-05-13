import Header from "../../components/header.d.md";

export default function Layout() {
  return {
    tag: "div",
    className: "layout",
    children: [
      Header(),
      {
        tag: "router-view",
      },
    ],
    mounted(layout) {
      console.log("layout mounted", layout);
    },
    unmounted() {
      console.log("layout unmounted");
    },
  };
}
