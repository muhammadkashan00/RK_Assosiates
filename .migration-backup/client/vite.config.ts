import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// The Express API runs on port 5000 in development.
// All requests to /api are proxied there so the app behaves as a single origin.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
})
