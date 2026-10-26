# Auto Captions Worker

This service handles video transcription and MP4 rendering outside the browser. It requires FFmpeg/FFprobe and the Python `.venv` dependencies installed by the Dockerfile.

## Required deployment configuration

- `FRONTEND_ORIGINS`: comma-separated exact browser origins allowed to call the worker, e.g. `https://autoseedance.site`. Add a preview origin only if needed.
- `PORT`: optional; defaults to `8080`.
- `CAPTIONS_UPLOAD_DIR` and `CAPTIONS_RENDER_DIR`: optional writable directories; defaults are under `/tmp`.
- `FFMPEG_PRESET` and `FFMPEG_CRF`: optional output quality/performance controls.

Set the frontend build variable `VITE_CAPTIONS_WORKER_URL` to the deployed worker's HTTPS base URL (no trailing slash). Without it, the captions UI cannot contact the worker.

## API flow

1. `POST /jobs` with multipart form field `video`. Files larger than 500 MiB are rejected.
2. `POST /jobs/:id/transcribe` with JSON `{"language":"auto"}` or a two/three-letter language code such as `en` or `ur`.
3. Poll `GET /jobs/:id` until `status` is `transcribed` or `failed`. Transcript segments contain `start`, `end`, and `text`.
4. `POST /jobs/:id/render` with JSON `{"styleId":"style-01","captions":[{"start":0,"end":1.2,"text":"Example"}]}`. The `captions` array is optional; when supplied, it replaces the transcript segments after validation.
5. Poll `GET /jobs/:id` until `completed`, then download from `GET /jobs/:id/download`. The result is an H.264/AAC MP4.

## Operational limitations

The current job registry is in-memory and uploaded/rendered files are stored locally. Restarting or scaling to multiple worker instances can make active jobs unavailable. Before public production use, add durable job/storage handling, automatic file cleanup, request authentication/rate limits, worker resource limits, and monitoring. Keep the worker behind HTTPS and restrict `FRONTEND_ORIGINS` to trusted origins.

## Health check

Call `GET /health`; it reports whether FFmpeg and FFprobe are available. This endpoint does not verify that the Whisper model can download or that a full transcription/render has succeeded.
