import express from "express";
import multer from "multer";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const app = express();
const port = Number(process.env.PORT || 8080);
const maxUploadBytes = 500 * 1024 * 1024;
const uploadDir = process.env.CAPTIONS_UPLOAD_DIR || "/tmp/captions-uploads";
const renderDir = process.env.CAPTIONS_RENDER_DIR || "/tmp/captions-renders";
fs.mkdirSync(uploadDir, { recursive: true });
fs.mkdirSync(renderDir, { recursive: true });

const jobs = new Map();
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, randomUUID() + ext);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: maxUploadBytes, files: 1 },
  fileFilter: (_req, file, cb) => {
    const allowed = new Set(["video/mp4", "video/quicktime", "video/webm", "video/x-matroska"]);
    if (!allowed.has(file.mimetype)) return cb(new Error("Unsupported video type. Upload MP4, MOV, WebM, or MKV."));
    cb(null, true);
  },
});

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk.toString(); });
    child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    child.once("error", reject);
    child.once("close", (code) => code === 0 ? resolve({ stdout, stderr }) : reject(new Error(stderr || command + " exited " + code)));
  });
}

app.get("/health", async (_req, res) => {
  try {
    const [{ stdout: ffmpeg }, { stdout: ffprobe }] = await Promise.all([
      run("ffmpeg", ["-version"]),
      run("ffprobe", ["-version"]),
    ]);
    res.json({ ok: true, service: "captions-worker", ffmpeg: ffmpeg.split("\n")[0], ffprobe: ffprobe.split("\n")[0], maxUploadBytes });
  } catch {
    res.status(503).json({ ok: false, error: "FFmpeg/FFprobe is not available in the worker." });
  }
});

app.get("/jobs/:id", (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found." });
  res.json({ id: job.id, status: job.status, progress: job.progress, error: job.error || null });
});

// Phase 2 validates and stores uploads and probes media metadata. Captioning/render
// execution is intentionally added in later phases before this endpoint is exposed to users.
app.post("/jobs", (req, res) => {
  upload.single("video")(req, res, async (error) => {
    if (error) {
      const tooLarge = error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE";
      return res.status(tooLarge ? 413 : 400).json({
        error: tooLarge ? "Maximum video upload size is 500 MB. Please choose a smaller video." : error.message,
        maxUploadBytes,
      });
    }
    if (!req.file) return res.status(400).json({ error: "Upload a video in the 'video' field." });

    const id = randomUUID();
    const job = { id, status: "validating", progress: 5, filePath: req.file.path, originalName: req.file.originalname, createdAt: new Date().toISOString() };
    jobs.set(id, job);
    try {
      const { stdout } = await run("ffprobe", [
        "-v", "error", "-show_entries", "format=duration,size,format_name",
        "-show_entries", "stream=codec_type,codec_name,width,height",
        "-of", "json", req.file.path,
      ]);
      const media = JSON.parse(stdout);
      job.media = media;
      job.status = "uploaded";
      job.progress = 10;
      return res.status(202).json({
        id,
        status: job.status,
        progress: job.progress,
        message: "Video uploaded and validated. Caption transcription and MP4 rendering will be enabled by the next worker phases.",
        media,
      });
    } catch (probeError) {
      jobs.delete(id);
      fs.promises.unlink(req.file.path).catch(() => {});
      return res.status(422).json({ error: "The uploaded file could not be read as a valid video.", detail: probeError.message });
    }
  });
});

app.use((error, _req, res, _next) => {
  console.error("Captions worker error:", error);
  res.status(500).json({ error: "Unexpected worker error." });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Captions worker listening on port ${port}`);
});
