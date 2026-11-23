import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const styles = JSON.parse(await readFile(new URL("../src/styles.json", import.meta.url), "utf8"));
const expectedEffects = new Set([
  "brush", "gradient", "box", "glitch", "frame", "icon", "arrow", "paint",
  "split", "slant", "motion", "outline", "stack", "banner", "minimal",
  "highlight", "button", "warm", "circle", "bubble", "glow", "emoji",
  "underline", "blocks",
]);

test("catalog contains exactly 60 uniquely identified caption styles", () => {
  assert.equal(styles.length, 60);
  assert.deepEqual(styles.map((style) => style.id).sort(), Array.from({ length: 60 }, (_, i) => `style-${String(i + 1).padStart(2, "0")}`).sort());
});

test("every style has valid render settings", () => {
  for (const style of styles) {
    assert.equal(typeof style.name, "string", `${style.id}: missing name`);
    assert.match(style.primary, /^#[0-9A-Fa-f]{6}$/, `${style.id}: invalid primary color`);
    assert.match(style.accent, /^#[0-9A-Fa-f]{6}$/, `${style.id}: invalid accent color`);
    assert.ok(["bold", "regular"].includes(style.weight), `${style.id}: invalid font weight`);
    assert.ok(expectedEffects.has(style.effect), `${style.id}: unsupported effect ${style.effect}`);
  }
});
