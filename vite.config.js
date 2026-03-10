import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  preview: {
    host: '0.0.0.0', // allow Render to bind
    port: 4173,       // you can keep default
    allowedHosts: ['chat-app-t05j.onrender.com'], // Add your deployed URL
  },
});
