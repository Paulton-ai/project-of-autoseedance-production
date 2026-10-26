import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const port = 18000 + Math.floor(Math.random() * 20000);
const baseUrl = `http://127.0.0.1:${port}`;
let worker;
let tempDir;

async function waitForWorker() {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    if (worker.exitCode !== null) throw new Error("Captions worker exited before starting.");
    try {
      const response = await fetch(baseUrl + "/jobs/not-a-real-job");
      if (response.status === 404) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Timed out waiting for captions worker to start.");
}

test.before(async () => {
  tempDir = await mkdtemp(path.join(os.tmpdir(), "captions-worker-test-"));
  worker = spawn(process.execPath, ["src/server.mjs"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: String(port),
      CAPTIONS_UPLOAD_DIR: path.join(tempDir, "uploads"),
      CAPTIONS_RENDER_DIR: path.join(tempDir, "renders"),
      FRONTEND_ORIGINS: "http://localhost:3000",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  await waitForWorker();
});

test.after(async () => {
  if (worker && worker.exitCode === null) {
    worker.kill("SIGTERM");
    await new Promise((resolve) => worker.once("exit", resolve));
  }
  if (tempDir) await rm(tempDir, { recursive: true, force: true });
});

test("unknown job IDs return 404", async () => {
  const response = await fetch(baseUrl + "/jobs/not-a-real-job");
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: "Job not found." });
});

test("job creation requires a video field", async () => {
  const response = await fetch(baseUrl + "/jobs", { method: "POST" });
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "Upload a video in the 'video' field." });
});

test("job creation rejects unsupported upload MIME types", async () => {
  const form = new FormData();
  form.append("video", new Blob(["not a video"], { type: "text/plain" }), "notes.txt");
  const response = await fetch(baseUrl + "/jobs", { method: "POST", body: form });
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.match(body.error, /Unsupported video type/);
  assert.equal(body.maxUploadBytes, 524288000);
});
