declare module "*.d.md" {
  import {
    IDomilyRenderOptions,
    type WithBaseProps,
  } from "@domily/runtime-core";
  export default function <T>(
    props?: WithBaseProps<T>
  ): IDomilyRenderOptions<any, any>;
}
