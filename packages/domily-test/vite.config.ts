import { defineConfig } from 'vite';
import inspect from 'vite-plugin-inspect';
import domily from 'vite-plugin-domily';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [inspect(), domily()],
});
