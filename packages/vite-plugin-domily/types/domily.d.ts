declare module "*.md" {
  import { IDomilyRenderSchema } from "@domily/runtime-core";
  export default function (): IDomilyRenderSchema<any, any>;
}
