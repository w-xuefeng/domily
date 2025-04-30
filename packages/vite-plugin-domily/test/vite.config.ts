import { defineConfig } from "vite";
import inspect from "vite-plugin-inspect";
import domily from "../index";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    inspect(),
    domily({
      customElement: {
        enable: false,
      },
    }),
  ],
});
