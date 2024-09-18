import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./", // This ensures assets are loaded using relative paths
  resolve: {
    alias: {
      '@console': path.resolve(__dirname, './app'),
      '@': path.resolve(__dirname, './packages'),
    },
  },
});