import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "node:path";

const reelCreditPolicy: Plugin = {
  name: "reel-credit-policy",
  enforce: "pre",
  transform(code, id) {
    if (!id.endsWith("/src/routes/tools.reel-studio.tsx")) return null;
    return code.replace('const base = quality === "premium" ? 80 : 40;', 'const base = 40;');
  },
};

export default defineConfig(({ ssrBuild }) => ({
  plugins: [
    tsconfigPaths(),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      routesDirectory: "src/routes",
      generatedRouteTree: "src/routeTree.gen.ts",
    }),
    reelCreditPolicy,
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: { host: "::", port: 8080 },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        entryFileNames: ssrBuild ? "entry-server.js" : "entry-client.js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: (assetInfo) =>
          assetInfo.name?.endsWith(".css")
            ? "assets/app.css"
            : "assets/[name]-[hash][extname]",
      },
    },
  },
}));
