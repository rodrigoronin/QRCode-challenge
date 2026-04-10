import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@entities": path.resolve(__dirname, "src/entities"),
      "@sprites": path.resolve(__dirname, "src/assets/sprites"),
      "@core": path.resolve(__dirname, "src/core"),
      "@input": path.resolve(__dirname, "src/input"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@assets": path.resolve(__dirname, "src/assets"),
      "@fx": path.resolve(__dirname, "src/fx"),
    },
  },
});
