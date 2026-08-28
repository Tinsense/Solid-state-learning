import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/Solid-state-learning/",
  plugins: [react()],
  build: {
    target: "es2022",
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          katex: ["katex"]
        }
      }
    }
  },
  server: { host: "127.0.0.1", port: 5173 }
});