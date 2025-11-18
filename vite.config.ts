import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  // A linha do "lovable-tagger" foi removida daqui para funcionar fora da IA
  plugins: [react()], 
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});