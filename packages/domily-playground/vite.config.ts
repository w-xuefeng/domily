import { defineConfig } from "vite";
import domily from "vite-plugin-domily";
import { fileURLToPath } from "url";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    domily(),
    VitePWA({
      devOptions: {
        enabled: true,
      },
      registerType: "autoUpdate",
      manifest: {
        name: "Domily Playground",
        short_name: "domily",
        theme_color: "#42b983",
        icons: [
          {
            src: "/domily/imgs/icon-192x192.webp",
            sizes: "192x192",
            type: "image/webp",
          },
          {
            src: "/domily/imgs/icon-512x512.webp",
            sizes: "512x512",
            type: "image/webp",
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 8 * 1024 ** 2,
        runtimeCaching: [
          {
            urlPattern: /\.(png|jpg|svg|woff2)/,
            handler: "CacheFirst",
            options: {
              cacheName: "static-assets",
              expiration: { maxEntries: 10, maxAgeSeconds: 86400 },
            },
          },
          {
            urlPattern: /\.(js|css|html)/,
            handler: "StaleWhileRevalidate",
          },
        ],
      },
      injectRegister: "auto",
    }),
  ],
  base: "/domily",
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
