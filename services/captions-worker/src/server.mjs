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
  res.json({ id: job.id, status: job.status, progress: job.progress, error: job.error || null, media: job.media || null, transcription: job.captions || null, render: job.render || null, downloadPath: job.status === "completed" ? `/jobs/${job.id}/download` : null });
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
    const job = { id, status: "validating", progress: 5, filePath: req.file.path, originalName: req.file.originalname, createdAt: new Date().toISOString(), captions: null };
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
        message: "Video uploaded and validated. Start transcription using POST /jobs/:id/transcribe.",
        media,
      });
    } catch (probeError) {
      jobs.delete(id);
      fs.promises.unlink(req.file.path).catch(() => {});
      return res.status(422).json({ error: "The uploaded file could not be read as a valid video.", detail: probeError.message });
    }
  });
});

app.post("/jobs/:id/transcribe", express.json(), async (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found." });
  if (job.status === "transcribing") return res.status(409).json({ error: "Transcription is already running." });
  if (job.status !== "uploaded" && job.status !== "transcribed") return res.status(409).json({ error: "Upload a valid video before transcription.", status: job.status });
  const requestedLanguage = typeof req.body?.language === "string" ? req.body.language.trim() : "auto";
  if (requestedLanguage !== "auto" && !/^[a-z]{2,3}$/i.test(requestedLanguage)) {
    return res.status(400).json({ error: "Language must be 'auto' or a two/three-letter language code." });
  }
  job.status = "transcribing";
  job.progress = 15;
  job.error = null;
  res.status(202).json({ id: job.id, status: job.status, progress: job.progress, message: "Whisper transcription started. Poll GET /jobs/:id for completion." });
  try {
    const { stdout } = await run(process.env.PYTHON_BIN || "/app/.venv/bin/python", [
      "/app/src/transcribe.py",
      job.filePath,
      requestedLanguage || "auto",
    ]);
    const transcript = JSON.parse(stdout);
    job.captions = transcript;
    job.status = "transcribed";
    job.progress = 55;
  } catch (error) {
    console.error("Whisper transcription failed for job", job.id, error);
    job.status = "failed";
    job.error = "Transcription failed. Check worker model download, memory, and logs, then retry.";
    job.progress = 0;
  }
});

app.post("/jobs/:id/render", express.json(), async (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found." });
  if (job.status !== "transcribed" || !job.captions) {
    return res.status(409).json({ error: "Complete transcription before rendering.", status: job.status });
  }
  const styleId = typeof req.body?.styleId === "string" ? req.body.styleId : "style-01";
  let availableStyles;
  try {
    availableStyles = JSON.parse(await fs.promises.readFile("/app/src/styles.json", "utf8"));
  } catch {
    return res.status(503).json({ error: "Caption style catalog is unavailable." });
  }
  if (!availableStyles.some((style) => style.id === styleId)) {
    return res.status(400).json({ error: "Unknown caption style.", availableStyles: availableStyles.length });
  }
  if (job.status === "rendering") return res.status(409).json({ error: "Render already running." });
  job.status = "rendering";
  job.progress = 60;
  job.error = null;
  job.styleId = styleId;
  job.outputPath = path.join(renderDir, job.id + ".mp4");
  const transcriptPath = path.join(renderDir, job.id + ".transcript.json");
  try {
    await fs.promises.writeFile(transcriptPath, JSON.stringify(job.captions), "utf8");
  } catch (error) {
    job.status = "failed";
    job.error = "Could not prepare transcript for rendering.";
    return res.status(500).json({ error: job.error });
  }
  res.status(202).json({ id: job.id, status: job.status, progress: job.progress, styleId, message: "MP4 render started. Poll GET /jobs/:id; download when status is completed." });
  try {
    const { stdout } = await run(process.env.PYTHON_BIN || "/app/.venv/bin/python", [
      "/app/src/render.py", job.filePath, transcriptPath, styleId, job.outputPath,
    ]);
    job.render = JSON.parse(stdout);
    job.status = "completed";
    job.progress = 100;
  } catch (error) {
    console.error("MP4 render failed for job", job.id, error);
    job.status = "failed";
    job.error = "MP4 rendering failed. Check FFmpeg logs and worker capacity.";
    job.progress = 0;
    fs.promises.unlink(job.outputPath).catch(() => {});
  } finally {
    fs.promises.unlink(transcriptPath).catch(() => {});
  }
});

app.get("/jobs/:id/download", (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found." });
  if (job.status !== "completed" || !job.outputPath || !fs.existsSync(job.outputPath)) {
    return res.status(409).json({ error: "MP4 is not ready yet.", status: job.status });
  }
  res.download(job.outputPath, "captioned-video.mp4");
});

app.use((error, _req, res, _next) => {
  console.error("Captions worker error:", error);
  res.status(500).json({ error: "Unexpected worker error." });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Captions worker listening on port ${port}`);
});
