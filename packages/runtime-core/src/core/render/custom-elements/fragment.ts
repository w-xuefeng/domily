import { domilyChildToDOM } from "../shared/parse";
import type { DOMilyChildren } from "../type/types";

export default class DomilyFragment extends HTMLElement {
  static name = "domily-fragment";
  child: DOMilyChildren;
  constructor(children: DOMilyChildren = []) {
    super();
    this.child = children;
  }
  connectedCallback() {
    if (!this.child?.length) {
      this.appendChild(document.createElement("slot"));
      return;
    }
    const documentFragment = document.createDocumentFragment();
    for (const item of this.child) {
      const dom = domilyChildToDOM(item);
      if (dom) {
        documentFragment.append(dom);
      }
    }
    this.appendChild(documentFragment);
  }
}
