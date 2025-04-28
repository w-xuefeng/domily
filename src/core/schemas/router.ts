import DomilyPageSchema from "./page";

export class DomilyRouter {
  public static routes: DomilyPageSchema<any>[];
  public static currentRoute: DomilyPageSchema<any>;
  public static resolve() {}
  public static push() {}
  public static back() {}
  public static go() {}
  public static replace() {}
}

export class DomilyRouterView extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {}
  disconnectedCallback() {}
}
