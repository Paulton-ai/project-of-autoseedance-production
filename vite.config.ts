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

const rootToolEducationFix: Plugin = {
  name: "root-tool-education-fix",
  enforce: "pre",
  transform(code, id) {
    if (!id.endsWith("/src/routes/__root.tsx")) return null;
    return code.replace("const { location } = useRouter();", "const location = useLocation();");
  },
};

const seoIntegrityFix: Plugin = {
  name: "seo-integrity-fix",
  enforce: "pre",
  transform(code, id) {
    if (!id.includes("/src/routes/") || !id.endsWith(".tsx")) return null;

    let output = code.replaceAll("https://autoseedance.site", "https://www.autoseedance.site");

    // Do not publish unsupported/fabricated aggregate ratings. Google requires
    // marked-up ratings to be visible to users and based on genuine evaluations.
    output = output.replace(/\s*aggregateRating:\s*\{\s*"@type":\s*"AggregateRating",\s*ratingValue:\s*"[^"]+",\s*ratingCount:\s*"[^"]+",\s*\},?/g, "");

    return output === code ? null : output;
  },
};

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [
    tsconfigPaths(),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      codeSplittingOptions: {
        defaultBehavior: [
          ["loader"],
          ["component"],
          ["errorComponent"],
          ["notFoundComponent"],
        ],
      },
      routesDirectory: "src/routes",
      generatedRouteTree: "src/routeTree.gen.ts",
    }),
    reelCreditPolicy,
    rootToolEducationFix,
    seoIntegrityFix,
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
        entryFileNames: isSsrBuild ? "entry-server.js" : "entry-client-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: (assetInfo) =>
          assetInfo.name?.endsWith(".css")
            ? "assets/app-[hash].css"
            : "assets/[name]-[hash][extname]",
      },
    },
  },
}));
