Reflect.set(
  globalThis,
  "globalEventMap",
  Reflect.get(globalThis, "globalEventMap") || new Map<string, Function[]>()
);

const globalEventMap = Reflect.get(globalThis, "globalEventMap") as Map<
  string,
  Function[]
>;

export class EventBus {
  static on<T = undefined>(eventName: string, callback: (e: T) => void) {
    const event = globalEventMap.get(eventName);
    if (event) {
      event.push(callback);
    }
    globalEventMap.set(eventName, event || [callback]);
  }

  static off<T = undefined>(eventName: string, callback?: (e: T) => void) {
    const event = globalEventMap.get(eventName);
    if (!callback || !event || event.length === 0) {
      globalEventMap.delete(eventName);
      return;
    }
    globalEventMap.set(
      eventName,
      event.filter((e) => e !== callback)
    );
  }

  static once<T = undefined>(eventName: string, callback: (e: T) => void) {
    const proxyCallback = (e: T) => {
      callback(e);
      this.off(eventName, proxyCallback);
    };
    this.on(eventName, proxyCallback);
  }

  static emit<T = undefined>(eventName: string, value: T) {
    const event = globalEventMap.get(eventName);
    if (!event) {
      return;
    }
    event.forEach((e) => {
      e(value);
    });
  }
}

export const EVENTS = {
  APP_MOUNTED: "app-mounted",
};
