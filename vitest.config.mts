import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "node",
    globals: true, // Allows using 'describe' and 'it' without manual imports
    setupFiles: "./vitest.setup.ts", // Optional: for global test setup
  },
});
