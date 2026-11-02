// Removes the duplicate site-wide homepage canonical link that the root route
// (src/routes/__root.tsx) and the static shell (index.html) emit on every page,
// so each page keeps only its own canonical URL. Idempotent: running twice is a
// no-op.
// Reason: Google reported "Duplicate without user-selected canonical" for blog
// and tool pages because two canonical links pointed to the homepage.
import { readFileSync, writeFileSync } from "node:fs";

const targets = [
  {
    file: new URL("../src/routes/__root.tsx", import.meta.url),
    pattern: /\n[ \t]*\{ rel: "canonical", href: SITE_URL \},/,
  },
  {
    file: new URL("../index.html", import.meta.url),
    pattern: /\n[ \t]*<link rel="canonical" href="https:\/\/www\.autoseedance\.site\/" \/>/,
  },
];

for (const { file, pattern } of targets) {
  const source = readFileSync(file, "utf8");
  const fixed = source.replace(pattern, "");
  if (fixed !== source) {
    writeFileSync(file, fixed);
    console.log(`[prepare-fix-canonical] removed duplicate canonical from ${file.pathname.split("/").pop()}`);
  }
}
