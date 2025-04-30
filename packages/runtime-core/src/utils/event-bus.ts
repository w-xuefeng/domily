class EventBus extends HTMLElement {
  constructor() {
    super();
  }

  on(
    eventName: string,
    callback: (e: CustomEvent<any>) => void,
    options?: boolean | AddEventListenerOptions
  ) {
    this.addEventListener(eventName, callback as (e: Event) => void, options);
  }

  off(
    eventName: string,
    callback: (e: Event | CustomEvent) => void,
    options?: boolean | EventListenerOptions
  ) {
    this.removeEventListener(eventName, callback, options);
  }

  once(
    eventName: string,
    callback: (e: Event | CustomEvent) => void,
    options?: boolean | AddEventListenerOptions
  ) {
    this.addEventListener(
      eventName,
      callback,
      Object.assign(
        {},
        typeof options === "object"
          ? options
          : {
              capture: options,
            },
        {
          once: true,
        }
      )
    );
  }

  emit<T>(eventName: string, value?: T) {
    this.dispatchEvent(new CustomEvent(eventName, { detail: value }));
  }
}

customElements.define("event-bus", EventBus);

export const EVENTS = {};

export const eventBus = new EventBus();
