import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',    // Target backend port, as per user prompt example
        changeOrigin: true,
        // The rewrite rule path.replace(/^\/api/, '/api') is effectively a no-op.
        // If the backend server listens on '/api/chat', this is fine.
        // If the backend server listens on '/chat' (expecting '/api' to be stripped),
        // then it should be: rewrite: (path) => path.replace(/^\/api/, ''),
        // Given user's curl example `curl -X POST http://localhost:4000/api/chat`,
        // the backend expects '/api/chat'. So, this rewrite is okay or can be omitted
        // if the proxy forwards the path correctly by default.
        // Let's keep it as specified by user, which is:
        // rewrite: path => path.replace(/^\/api/, '/api'), (which was already there)
        // The crucial change is the target port.
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));