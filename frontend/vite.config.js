import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@console': path.resolve(__dirname, './packages/console'),
            '@': path.resolve(__dirname, './packages'),
        },
    },
});
