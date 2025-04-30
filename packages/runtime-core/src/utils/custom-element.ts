export class DomilyFragment extends HTMLElement {
  static name = "domily-fragment";
  child: (HTMLElement | Node | string | null)[];
  constructor(children: (HTMLElement | Node | string | null)[] = []) {
    super();
    this.child = children;
  }
  connectedCallback() {
    if (!this.child.length) {
      this.appendChild(document.createElement("slot"));
      return;
    }
    const documentFragment = document.createDocumentFragment();
    for (const item of this.child) {
      if (item) {
        documentFragment.append(item);
      }
    }
    this.appendChild(documentFragment);
  }
}
