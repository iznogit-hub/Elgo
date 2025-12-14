import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [], // We will add this later for global component cleanup
    include: ["src/**/*.{test,spec}.{js,ts,jsx,tsx}"],
  },
});
