import { defineConfig } from "vite";
import inspect from "vite-plugin-inspect";
import domily from "vite-plugin-domily";
import { fileURLToPath } from "url";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [inspect(), domily()],
  base: "/domily",
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
