export const DomilyAppDefault = {
  title: "Domily App",
  mode: "SPA" as const,
  el: "#app",
};

export const PROVIDER_KEY = Symbol("provider");

export const _IS_DEV_ = process.env.NODE_ENV !== "production";
