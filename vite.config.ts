import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
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
  build: {
    // Otimizações para navegadores móveis
    target: 'esnext',
    assetsInlineLimit: 4096, // Inline pequenos assets
    cssCodeSplit: false, // Evitar divisão de CSS para carregamento mais rápido
    reportCompressedSize: false, // Melhorar velocidade de build
    rollupOptions: {
      output: {
        manualChunks: undefined, // Evitar divisão de chunks para carregamento mais rápido
      },
    },
  },
}));
