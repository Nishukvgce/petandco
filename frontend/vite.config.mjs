import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tagger from "@dhiwise/component-tagger";
import path from "path";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  // Base path for assets - use '/' for root deployment
  base: '/',

  // This changes the out put dir from dist to build
  // comment this out if that isn't relevant for your project
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 2000,
    sourcemap: false, // Disable sourcemaps in production for smaller bundles
  },
  plugins: [tsconfigPaths(), react(), tagger()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom')
    }
  },
  server: {
    port: 3000,
    host: "0.0.0.0",
    strictPort: true,
    allowedHosts: true
  }
});