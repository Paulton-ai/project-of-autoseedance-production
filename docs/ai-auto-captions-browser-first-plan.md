# AI Auto Captions: browser-first implementation plan

## Goal
Make the standalone AI Auto Captions Generator usable without a separately hosted captions worker, while keeping the existing worker implementation available as a fallback. This plan is intentionally isolated from the production route until the browser pipeline passes the acceptance checks below.

## Findings
- The current page calls `VITE_CAPTIONS_WORKER_URL` for upload, Whisper transcription, and FFmpeg MP4 rendering.
- `@huggingface/transformers` is already a project dependency, so browser-side ASR can be prototyped without adding a paid API.
- The existing worker uses `faster-whisper` and system FFmpeg. Neither can run inside a Vercel Edge Function or a normal browser bundle.
- Browser ASR still needs audio extraction/resampling. MP4 export needs an actual MP4-capable encoder; `MediaRecorder` commonly produces WebM and is not a valid replacement for the advertised MP4 export.
- A browser-only implementation has device-memory, CPU, model-download, and cross-origin isolation constraints. The existing 500 MB promise must not be reused without device testing.

## Recommended implementation sequence
1. Keep production `main` unchanged; develop on a feature branch and use a preview deployment.
2. Add a browser-processing adapter that dynamically loads Transformers.js ASR and downloads model assets only after the user starts processing. Do not load the model on initial page render.
3. Add bounded video/audio validation and extract audio to mono 16 kHz Float32 samples using a browser-compatible demux/decode path. Show meaningful progress and cancellation; do not silently upload the video to a third party.
4. Convert ASR output to the page's existing `{ start, end, text }` caption shape and preserve language selection where the chosen model supports it.
5. Implement caption burn-in and MP4 encoding with a browser-compatible FFmpeg WASM build. Confirm the selected build supports the filters/fonts/codecs used by the existing styles. Keep SRT download available independently.
6. Retain the server worker path as an optional fallback, but never imply it is configured when `VITE_CAPTIONS_WORKER_URL` is absent.
7. Only enable browser processing by default after the acceptance matrix passes. If MP4 rendering cannot pass, expose SRT export honestly and keep MP4 disabled rather than returning WebM with an `.mp4` extension.

## Acceptance checks before production
- `npm run build` and `npm run lint` pass.
- Small MP4 with English speech: model loads, transcript has non-empty timestamps, and SRT downloads.
- Urdu and at least one additional language: verify whether the chosen model supports each language; don't promise unsupported languages.
- MP4 export produces a file identified as MP4 by a media probe and plays in Chrome and VLC.
- Test a 1-minute and 5-minute clip on a typical 8 GB RAM desktop, including cancellation and a failed/unsupported codec path.
- No request to an unconfigured captions worker; no regression to other routes or tools.
- Test mobile Safari separately before advertising mobile support.

## Important limitation
This document records the implementation plan and technical constraints; it is not evidence that browser transcription or MP4 export has already been implemented or tested.
