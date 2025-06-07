import { KebabToCamel } from "../../../utils/dom";
import { ref, computed, handleWithFunType } from "../../reactive";
import { type IDomilyRenderOptions } from "../../render";

const classNames = (value: (string | undefined)[]) => {
  return value.filter(Boolean).join(" ");
};

const nextFrame = (callback: FrameRequestCallback) => {
  requestAnimationFrame(() => {
    requestAnimationFrame(callback);
  });
};

function toMilliseconds(time: string) {
  if (time.endsWith("ms")) {
    return parseFloat(time);
  } else if (time.endsWith("s")) {
    return parseFloat(time) * 1000;
  }
  return 0;
}

function getTotalTransitionTime(element: HTMLElement) {
  if (!(element instanceof HTMLElement)) {
    return 0;
  }
  const style = window.getComputedStyle(element);
  const durations = style.transitionDuration.split(",").map((d) => d.trim());
  const delays = style.transitionDelay.split(",").map((d) => d.trim());

  const durationArray = durations.map(toMilliseconds);
  const delayArray = delays.map(toMilliseconds);

  const maxLength = Math.max(durationArray.length, delayArray.length);
  if (durationArray.length < maxLength) {
    durationArray.length = maxLength;
    for (let i = durationArray.length; i < maxLength; i++) {
      durationArray[i] = durationArray[i % durationArray.length];
    }
  }
  if (delayArray.length < maxLength) {
    delayArray.length = maxLength;
    for (let i = delayArray.length; i < maxLength; i++) {
      delayArray[i] = delayArray[i % delayArray.length];
    }
  }
  const totalTimes = durationArray.map((dur, index) => dur + delayArray[index]);
  const maxTotalTime = Math.max(...totalTimes);
  return maxTotalTime;
}

interface IAnimationClassNames {
  enterFrom: string;
  enterActive: string;
  enterTo: string;
  leaveFrom: string;
  leaveActive: string;
  leaveTo: string;
}

export default function Transition(props?: {
  name?: string;
  duration?: number | { enter?: number; leave?: number };
  type?: "transition" | "animation";
  slot?: IDomilyRenderOptions;
}) {
  const { name, slot, type = "transition", duration } = props || {};

  if (!name || !slot) {
    return slot;
  }

  const animationClassNames = Object.fromEntries(
    [
      "enter-from",
      "enter-active",
      "enter-to",
      "leave-from",
      "leave-active",
      "leave-to",
    ].map((e) => [KebabToCamel(e), `${name}-${e}`])
  ) as unknown as IAnimationClassNames;

  const cls = ref<string>("");

  const enter = (dom: HTMLElement | Node | null) => {
    let timer: number;
    nextFrame(() => {
      if (!dom) {
        return;
      }
      const end = () => {
        clearTimeout(timer);
        if (cls.value === "") {
          return;
        }
        cls.value = "";
      };

      dom?.addEventListener(type + "end", end, { once: true });

      const totalTransitionTime = getTotalTransitionTime(dom as HTMLElement);

      const timeout =
        typeof duration === "number"
          ? duration
          : typeof duration === "object" && typeof duration?.enter === "number"
          ? duration.enter
          : totalTransitionTime + 1;

      timer = window.setTimeout(end, timeout);

      cls.value = classNames([
        animationClassNames.enterActive,
        animationClassNames.enterTo,
      ]);
    });
  };
  const leave = (dom: HTMLElement | Node | null) => {
    const { promise, resolve } = Promise.withResolvers<void>();
    cls.value = classNames([
      animationClassNames.leaveFrom,
      animationClassNames.leaveActive,
    ]);

    let timer: number;

    nextFrame(() => {
      if (!dom) {
        return;
      }
      const end = () => {
        clearTimeout(timer);
        if (cls.value === "") {
          resolve();
          return;
        }
        cls.value = "";
        resolve();
      };

      dom?.addEventListener(type + "end", end, { once: true });

      const totalTransitionTime = getTotalTransitionTime(dom as HTMLElement);

      const timeout =
        typeof duration === "number"
          ? duration
          : typeof duration === "object" && typeof duration?.leave === "number"
          ? duration.leave
          : totalTransitionTime + 1;

      timer = window.setTimeout(end, timeout);

      cls.value = classNames([
        animationClassNames.leaveActive,
        animationClassNames.leaveTo,
      ]);
    });
    return promise;
  };

  const originalBeforeMount = slot.beforeMount;
  const originalMounted = slot.mounted;
  const originalBeforeUnmount = slot.beforeUnmount;
  const originalUnmounted = slot.unmounted;
  const originalClassName = slot.className;

  slot.beforeMount = (dom: HTMLElement | Node | null) => {
    typeof originalBeforeMount === "function" && originalBeforeMount(dom);
    cls.value = classNames([
      animationClassNames.enterFrom,
      animationClassNames.enterActive,
    ]);
  };

  slot.mounted = (dom: HTMLElement | Node | null) => {
    typeof originalMounted === "function" && originalMounted(dom);
    enter(dom);
  };

  slot.beforeUnmount = (dom: HTMLElement | Node | null) => {
    typeof originalBeforeUnmount === "function" && originalBeforeUnmount(dom);
    return leave(dom);
  };

  slot.unmounted = () => {
    typeof originalUnmounted === "function" && originalUnmounted();
  };

  slot.className = computed(() =>
    classNames([handleWithFunType(originalClassName), cls.value])
  );

  return slot;
}
