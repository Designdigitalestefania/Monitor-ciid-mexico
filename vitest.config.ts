import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    server: {
      deps: {
        inline: [],
        external: [/^node:/],
      },
    },
  },
  optimizeDeps: {
    exclude: ["node:sqlite"],
  },
  ssr: {
    external: ["node:sqlite"],
    noExternal: [],
  },
});
