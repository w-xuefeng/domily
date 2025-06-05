export const DomilyAppDefault = {
  title: "Domily App",
  mode: "SPA" as const,
  el: "#app",
};

export const LIST_MAP_KEY_ATTR = "___$domily-list-map-key";

export const PROVIDER_KEY = Symbol("provider");

export const _IS_DEV_ = process.env.NODE_ENV !== "production";

export const TELEPORT_KEY = Symbol("DOM_WILL_TELEPORT_TO");
