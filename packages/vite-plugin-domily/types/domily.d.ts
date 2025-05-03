declare module "*.md" {
  import { IDomilyRenderOptions } from "@domily/runtime-core";
  export default function (): IDomilyRenderOptions<any, any>;
}
