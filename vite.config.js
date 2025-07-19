import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/local": {
        target: "http://localhost:1234",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/local/, ""),
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000, // Tăng limit để tránh warning
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          vendor: ['react', 'react-dom'],
          
          // UI chunks
          markdown: [
            'react-markdown', 
            'remark-gfm', 
            'rehype-highlight'
          ],
          syntax: [
            'react-syntax-highlighter'
          ],
          
          // Component chunks - lazy loaded modals
          modals: [
            './src/components/Settings/SettingsModal.jsx',
            './src/components/WorkspaceManager/WorkspaceManager.jsx',
            './src/components/PromptTemplateManager/PromptTemplateManager.jsx',
            './src/components/WorkspacePrompt/WorkspacePromptModal.jsx',
            './src/components/WorkspaceInfo/WorkspaceInfoModal.jsx'
          ]
        }
      }
    }
  }
});
