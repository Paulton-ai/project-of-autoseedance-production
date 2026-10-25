import { createFileRoute } from "@tanstack/react-router";
import { pipeline } from "@huggingface/transformers";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ToolNavbar } from "@/components/tools/ToolNavbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Upload, Captions, WandSparkles, Download, FileText, CheckCircle2, AlertCircle, Languages, Sparkles } from "lucide-react";

export const Route = createFileRoute("/tools/captions")({
  component: AutoCaptionsPage,
  head: () => ({
    meta: [
      { title: "Free AI Auto Captions Generator — Auto Seedance" },
      { name: "description", content: "Generate captions from your own video with multilingual AI speech recognition. Choose a caption template, preview it, edit the transcript, and export a captioned video for free." },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://autoseedance.site/tools/captions" }],
  }),
});

type Caption = { start: number; end: number; text: string };
type TemplateId = "creator" | "karaoke" | "minimal" | "boxed" | "neon" | "podcast" | "classic" | "highlight";

const TEMPLATES: { id: TemplateId; name: string; detail: string; color: string; highlight: string; font: string; casing: "upper" | "normal" }[] = [
  { id: "creator", name: "Creator Bold", detail: "Bold white with dark outline", color: "#ffffff", highlight: "#facc15", font: "Arial Black", casing: "upper" },
  { id: "karaoke", name: "Karaoke Pop", detail: "Word-by-word yellow emphasis", color: "#ffffff", highlight: "#fde047", font: "Arial Black", casing: "upper" },
  { id: "minimal", name: "Clean Minimal", detail: "Simple, clean subtitles", color: "#ffffff", highlight: "#ffffff", font: "Arial", casing: "normal" },
  { id: "boxed", name: "Caption Box", detail: "Readable dark translucent panel", color: "#ffffff", highlight: "#67e8f9", font: "Arial", casing: "normal" },
  { id: "neon", name: "Neon Glow", detail: "Cyan glow with creator energy", color: "#67e8f9", highlight: "#f0abfc", font: "Arial Black", casing: "upper" },
  { id: "podcast", name: "Podcast Clean", detail: "Strong podcast-style emphasis", color: "#ffffff", highlight: "#fb7185", font: "Arial Black", casing: "normal" },
  { id: "classic", name: "Classic Subtitle", detail: "Traditional bottom subtitle", color: "#ffffff", highlight: "#ffffff", font: "Arial", casing: "normal" },
  { id: "highlight", name: "Green Highlight", detail: "Bright green active words", color: "#ffffff", highlight: "#86efac", font: "Arial Black", casing: "upper" },
];

const formatTime = (seconds: number) => {
  const safe = Math.max(0, seconds);
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = Math.floor(safe % 60);
  const ms = Math.floor((safe % 1) * 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
};

function toSrt(captions: Caption[]) {
  return captions.map((c, i) => `${i + 1}\n${formatTime(c.start)} --> ${formatTime(c.end)}\n${c.text}\n`).join("\n");
}

function AutoCaptionsPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("creator");
  const [status, setStatus] = useState<"idle" | "loading-model" | "transcribing" | "ready" | "exporting">("idle");
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [exportUrl, setExportUrl] = useState("");
  const [language, setLanguage] = useState("auto");
  const [showTranscript, setShowTranscript] = useState(false);

  const template = useMemo(() => TEMPLATES.find((item) => item.id === selectedTemplate) ?? TEMPLATES[0], [selectedTemplate]);
  const activeCaption = useMemo(() => captions.find((c) => currentTime >= c.start && currentTime <= c.end), [captions, currentTime]);

  useEffect(() => () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    if (exportUrl) URL.revokeObjectURL(exportUrl);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  }, [exportUrl]);

  const onFile = useCallback((picked?: File) => {
    if (!picked) return;
    if (!picked.type.startsWith("video/")) {
      toast.error("Please select a video file.");
      return;
    }
    if (picked.size > 1024 * 1024 * 1024) {
      toast.error("Please choose a video smaller than 1 GB for browser processing.");
      return;
    }
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    if (exportUrl) URL.revokeObjectURL(exportUrl);
    const url = URL.createObjectURL(picked);
    objectUrlRef.current = url;
    setFile(picked);
    setVideoUrl(url);
    setCaptions([]);
    setError("");
    setExportUrl("");
    setProgress(0);
    setStatus("idle");
  }, [exportUrl]);

  const transcribe = useCallback(async () => {
    if (!file || !videoRef.current) return;
    setError("");
    setStatus("loading-model");
    setProgress(5);
    setProgressLabel("Loading the open-source Whisper model…");
    try {
      // Whisper runs in the user's browser. Audio is not uploaded to our server.
      const transcriber = await pipeline("automatic-speech-recognition", "onnx-community/whisper-tiny", {
        dtype: "q4",
        device: "wasm",
        progress_callback: (event: { status?: string; progress?: number; file?: string }) => {
          if (typeof event.progress === "number") setProgress(Math.min(35, 5 + event.progress * 0.3));
          if (event.status === "progress" && event.file) setProgressLabel(`Downloading model: ${event.file.split("/").pop()}`);
        },
      });
      setStatus("transcribing");
      setProgress(38);
      setProgressLabel("Reading audio and detecting spoken language…");
      const audioContext = new AudioContext({ sampleRate: 16000 });
      const arrayBuffer = await file.arrayBuffer();
      const decoded = await audioContext.decodeAudioData(arrayBuffer.slice(0));
      const source = decoded.getChannelData(0);
      const inputRate = decoded.sampleRate;
      const targetLength = Math.ceil(source.length * 16000 / inputRate);
      const mono = new Float32Array(targetLength);
      if (inputRate === 16000) mono.set(source);
      else {
        for (let i = 0; i < targetLength; i++) {
          const pos = i * inputRate / 16000;
          const left = Math.floor(pos);
          const right = Math.min(source.length - 1, left + 1);
          const fraction = pos - left;
          mono[i] = source[left] * (1 - fraction) + source[right] * fraction;
        }
      }
      await audioContext.close();
      setProgress(55);
      setProgressLabel("Transcribing locally in your browser. Longer videos may take a while…");
      const options: Record<string, unknown> = { return_timestamps: "word", chunk_length_s: 30, stride_length_s: 5 };
      if (language !== "auto") options.language = language;
      const result = await (transcriber as (audio: Float32Array, options: Record<string, unknown>) => Promise<{ text?: string; chunks?: { text?: string; timestamp?: [number | null, number | null] }[] }>)(mono, options);
      const chunks = (result.chunks ?? []).map((chunk) => ({
        start: Number(chunk.timestamp?.[0] ?? 0),
        end: Number(chunk.timestamp?.[1] ?? (Number(chunk.timestamp?.[0] ?? 0) + 1)),
        text: (chunk.text ?? "").trim(),
      })).filter((chunk) => chunk.text && Number.isFinite(chunk.start) && Number.isFinite(chunk.end) && chunk.end > chunk.start);
      if (!chunks.length && result.text?.trim()) {
        setCaptions([{ start: 0, end: Math.min(4, decoded.duration || 4), text: result.text.trim() }]);
      } else {
        setCaptions(chunks);
      }
      setProgress(100);
      setProgressLabel("Captions generated. Select a style and review the transcript.");
      setStatus("ready");
      setShowTranscript(true);
      toast.success("Captions generated on your device.");
    } catch (e) {
      console.error("[auto-captions] transcription failed", e);
      const message = e instanceof Error ? e.message : "Unknown error";
      setError(message.includes("decodeAudioData") ? "This video’s audio could not be decoded by your browser. Try MP4 with AAC audio." : `Could not generate captions: ${message}. Try a supported browser or a smaller video.`);
      setStatus("idle");
      setProgress(0);
      setProgressLabel("");
    }
  }, [file, language]);

  const updateCaption = (index: number, text: string) => setCaptions((old) => old.map((c, i) => i === index ? { ...c, text } : c));

  const downloadText = (name: string, text: string, type: string) => {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportVideo = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !captions.length) return;
    if (!("MediaRecorder" in window) || !canvas.captureStream) {
      toast.error("Video export is not supported in this browser. Download the SRT file instead.");
      return;
    }
    setStatus("exporting");
    setProgress(0);
    setProgressLabel("Preparing captioned video…");
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    const scale = Math.min(1, 1920 / width, 1920 / height);
    canvas.width = Math.max(2, Math.round(width * scale));
    canvas.height = Math.max(2, Math.round(height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) { setStatus("ready"); return; }
    const videoStream = (video as HTMLVideoElement & { captureStream?: () => MediaStream }).captureStream?.();
    if (!videoStream) {
      setStatus("ready");
      toast.error("Your browser cannot capture video audio. Try Chrome or download SRT.");
      return;
    }
    const outputStream = canvas.captureStream(30);
    videoStream.getAudioTracks().forEach((track) => outputStream.addTrack(track));
    const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus") ? "video/webm;codecs=vp9,opus" : "video/webm";
    const recorder = new MediaRecorder(outputStream, { mimeType: mime });
    const parts: BlobPart[] = [];
    recorder.ondataavailable = (event) => { if (event.data.size) parts.push(event.data); };
    const recorded = new Promise<Blob>((resolve, reject) => {
      recorder.onerror = () => reject(new Error("The browser failed while exporting the video."));
      recorder.onstop = () => resolve(new Blob(parts, { type: mime }));
    });
    const draw = () => {
      if (!ctx || !video) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const current = video.currentTime;
      const active = captions.find((c) => current >= c.start && current <= c.end);
      if (active) {
        const fontSize = Math.max(22, Math.round(canvas.width * (selectedTemplate === "minimal" || selectedTemplate === "classic" ? 0.035 : 0.052)));
        const words = (template.casing === "upper" ? active.text.toUpperCase() : active.text).split(/\s+/);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `900 ${fontSize}px ${template.font}, sans-serif`;
        const maxWidth = canvas.width * 0.86;
        const lines: string[] = [];
        let line = "";
        for (const word of words) {
          const test = line ? `${line} ${word}` : word;
          if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = word; } else line = test;
        }
        if (line) lines.push(line);
        const lineHeight = fontSize * 1.22;
        const yStart = canvas.height * 0.78 - (lines.length - 1) * lineHeight / 2;
        lines.forEach((lineText, i) => {
          const y = yStart + i * lineHeight;
          if (selectedTemplate === "boxed") {
            const textWidth = Math.min(maxWidth, ctx.measureText(lineText).width + fontSize * 0.7);
            ctx.fillStyle = "rgba(0,0,0,.72)";
            ctx.fillRect((canvas.width - textWidth) / 2, y - lineHeight / 2, textWidth, lineHeight);
          }
          ctx.lineJoin = "round";
          ctx.lineWidth = Math.max(3, fontSize * 0.16);
          ctx.strokeStyle = selectedTemplate === "minimal" || selectedTemplate === "classic" ? "rgba(0,0,0,.7)" : "#09090b";
          ctx.strokeText(lineText, canvas.width / 2, y, maxWidth);
          ctx.shadowColor = selectedTemplate === "neon" ? template.highlight : "transparent";
          ctx.shadowBlur = selectedTemplate === "neon" ? 18 : 0;
          ctx.fillStyle = selectedTemplate === "neon" ? template.color : template.color;
          ctx.fillText(lineText, canvas.width / 2, y, maxWidth);
          ctx.shadowBlur = 0;
        });
      }
      setProgress(Math.min(98, Math.round(video.currentTime / Math.max(1, video.duration) * 100)));
      if (!video.paused && !video.ended) animationRef.current = requestAnimationFrame(draw);
    };
    video.currentTime = 0;
    await new Promise<void>((resolve) => {
      if (video.readyState >= 2) resolve();
      else video.onloadeddata = () => resolve();
    });
    await new Promise<void>((resolve) => { video.onseeked = () => resolve(); if (video.currentTime === 0) resolve(); });
    recorder.start(250);
    video.muted = false;
    await video.play();
    draw();
    await new Promise<void>((resolve) => { video.onended = () => resolve(); });
    recorder.stop();
    const blob = await recorded;
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    outputStream.getTracks().forEach((track) => track.stop());
    videoStream.getTracks().forEach((track) => track.stop());
    const url = URL.createObjectURL(blob);
    setExportUrl(url);
    setProgress(100);
    setProgressLabel("Export complete. Download your captioned video below.");
    setStatus("ready");
    toast.success("Captioned video is ready to download.");
  }, [captions, selectedTemplate, template]);

  return (
    <div className="min-h-screen bg-background">
      <ToolNavbar title="AI Auto Captions Studio" />
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-24">
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <Badge variant="outline" className="mb-4 gap-1.5"><Sparkles className="size-3.5" /> Free · Runs in your browser</Badge>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">Make every word stand out.</h1>
          <p className="mt-4 text-muted-foreground sm:text-lg">Upload a video, automatically transcribe speech, choose a creator-style caption template, and export your captioned video. No caption API credits.</p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)]">
          <div className="space-y-6">
            <Card className="overflow-hidden border-border/80">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div className="flex items-center gap-2 font-semibold"><Upload className="size-4 text-primary" /> 1. Upload your video</div>
                {file && <Badge variant="secondary">{(file.size / (1024 * 1024)).toFixed(1)} MB</Badge>}
              </div>
              <div className="p-5">
                {!videoUrl ? (
                  <button type="button" onClick={() => inputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }} className="flex min-h-56 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 px-5 text-center transition hover:border-primary/60 hover:bg-primary/5">
                    <span className="mb-3 grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary"><Upload className="size-6" /></span>
                    <span className="font-semibold">Drop your video here or browse files</span>
                    <span className="mt-1 text-sm text-muted-foreground">MP4, MOV, WebM · Up to 1 GB · Processed on your device</span>
                  </button>
                ) : (
                  <div className="space-y-3">
                    <video ref={videoRef} src={videoUrl} controls playsInline onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)} className="max-h-[520px] w-full rounded-lg bg-black" />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0"><p className="truncate text-sm font-medium">{file?.name}</p><p className="text-xs text-muted-foreground">Preview updates with your selected caption style</p></div>
                      <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()}>Change video</Button>
                    </div>
                  </div>
                )}
                <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
              </div>
            </Card>

            <Card className="border-border/80">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div className="flex items-center gap-2 font-semibold"><Languages className="size-4 text-primary" /> 2. Generate captions</div>
                <Badge variant="outline">Whisper AI</Badge>
              </div>
              <div className="space-y-4 p-5">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="space-y-2"><Label>Spoken language</Label><Select value={language} onValueChange={setLanguage}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="auto">Auto-detect (recommended)</SelectItem><SelectItem value="english">English</SelectItem><SelectItem value="urdu">Urdu</SelectItem><SelectItem value="spanish">Spanish</SelectItem><SelectItem value="french">French</SelectItem><SelectItem value="german">German</SelectItem><SelectItem value="hindi">Hindi</SelectItem><SelectItem value="arabic">Arabic</SelectItem><SelectItem value="portuguese">Portuguese</SelectItem><SelectItem value="japanese">Japanese</SelectItem></SelectContent></Select></div>
                  <div className="flex items-end"><Button className="w-full" onClick={transcribe} disabled={!file || status === "loading-model" || status === "transcribing" || status === "exporting"}><WandSparkles className="mr-2 size-4" />{status === "loading-model" ? "Loading AI…" : status === "transcribing" ? "Transcribing…" : captions.length ? "Regenerate captions" : "Generate auto captions"}</Button></div>
                </div>
                {(status === "loading-model" || status === "transcribing" || status === "exporting") && <div className="space-y-2"><div className="flex justify-between text-xs text-muted-foreground"><span>{progressLabel}</span><span>{progress}%</span></div><Progress value={progress} /></div>}
                {error && <div className="flex gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"><AlertCircle className="mt-0.5 size-4 shrink-0" /><span>{error}</span></div>}
                <p className="text-xs leading-5 text-muted-foreground">The first run downloads a small open-source speech model and may take a few minutes. Audio is processed locally in your browser; longer videos need more memory and processing time.</p>
              </div>
            </Card>

            {captions.length > 0 && <Card className="border-border/80">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div className="flex items-center gap-2 font-semibold"><FileText className="size-4 text-primary" /> 3. Review transcript <Badge variant="secondary">{captions.length} segments</Badge></div>
                <Button variant="ghost" size="sm" onClick={() => setShowTranscript((v) => !v)}>{showTranscript ? "Hide" : "Edit captions"}</Button>
              </div>
              {showTranscript && <div className="max-h-[440px] space-y-3 overflow-y-auto p-5">
                {captions.map((caption, index) => <div key={index} className="grid gap-2 sm:grid-cols-[110px_1fr]"><button type="button" className="text-left text-xs tabular-nums text-muted-foreground hover:text-primary" onClick={() => { if (videoRef.current) videoRef.current.currentTime = caption.start; }} title="Jump to this caption">{caption.start.toFixed(2)}s – {caption.end.toFixed(2)}s</button><Textarea value={caption.text} onChange={(e) => updateCaption(index, e.target.value)} rows={2} className="min-h-0 resize-y" aria-label={`Caption segment ${index + 1}`} /></div>)}
              </div>}
              <div className="flex flex-wrap gap-2 border-t border-border p-5">
                <Button variant="outline" onClick={() => downloadText("captions.srt", toSrt(captions), "text/plain;charset=utf-8")}><Download className="mr-2 size-4" /> Download SRT</Button>
                <Button onClick={exportVideo} disabled={status === "exporting"}><Download className="mr-2 size-4" />{status === "exporting" ? "Exporting…" : "Export captioned video"}</Button>
              </div>
              {exportUrl && <div className="flex items-center justify-between gap-3 border-t border-border bg-primary/5 p-5"><div className="flex items-center gap-2 text-sm"><CheckCircle2 className="size-4 text-primary" /><span>Captioned video ready</span></div><a href={exportUrl} download={`${file?.name.replace(/\.[^.]+$/, "") || "captioned-video"}-captions.webm`} className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground">Download video</a></div>}
            </Card>}
          </div>

          <div className="space-y-6 lg:sticky lg:top-20">
            <Card className="border-border/80">
              <div className="flex items-center justify-between border-b border-border px-5 py-4"><div className="flex items-center gap-2 font-semibold"><Captions className="size-4 text-primary" /> Caption templates</div><Badge variant="secondary">{TEMPLATES.length} styles</Badge></div>
              <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4 lg:grid-cols-2">
                {TEMPLATES.map((item) => <button key={item.id} type="button" onClick={() => setSelectedTemplate(item.id)} aria-pressed={selectedTemplate === item.id} className={`group rounded-xl border p-2 text-left transition ${selectedTemplate === item.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/50"}`}>
                  <div className="flex h-20 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 p-2">
                    <span style={{ color: item.color, fontFamily: item.font, textShadow: item.id === "neon" ? `0 0 12px ${item.highlight}` : "2px 2px 0 #000, -1px -1px 0 #000", background: item.id === "boxed" ? "rgba(0,0,0,.7)" : "transparent" }} className="text-center text-xs font-black leading-tight">{item.id === "minimal" ? "make it simple" : item.id === "classic" ? "Your subtitle here" : item.id === "podcast" ? "HERE'S THE POINT" : item.id === "neon" ? "CREATE DIFFERENT" : item.id === "highlight" ? "MAKE IT POP" : item.id === "boxed" ? "Read every word" : item.id === "karaoke" ? "ONE WORD AT A TIME" : "YOUR STORY HERE"}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-1"><span className="truncate text-xs font-semibold">{item.name}</span>{selectedTemplate === item.id && <CheckCircle2 className="size-3.5 shrink-0 text-primary" />}</div>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-muted-foreground">{item.detail}</p>
                </button>)}
              </div>
              <div className="border-t border-border p-5">
                <Label className="mb-2 block">Live preview</Label>
                <div className="relative flex aspect-[9/12] max-h-[360px] items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-zinc-800 via-zinc-950 to-zinc-700 p-6">
                  {videoUrl ? <video src={videoUrl} muted className="absolute inset-0 h-full w-full object-contain opacity-70" /> : <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-700 via-zinc-900 to-black" />}
                  <div className="absolute inset-x-4 bottom-[18%] flex justify-center"><span style={{ color: template.color, fontFamily: template.font, textShadow: template.id === "neon" ? `0 0 14px ${template.highlight}` : "3px 3px 0 #000, -2px -2px 0 #000", background: template.id === "boxed" ? "rgba(0,0,0,.72)" : "transparent" }} className="max-w-full text-center text-xl font-black leading-tight">{activeCaption?.text ? (template.casing === "upper" ? activeCaption.text.toUpperCase() : activeCaption.text) : template.id === "minimal" ? "your captions will appear here" : "YOUR CAPTION HERE"}</span></div>
                  <Badge className="absolute left-3 top-3 bg-black/50 text-white hover:bg-black/50">9:16 preview</Badge>
                </div>
                <p className="mt-3 text-xs leading-5 text-muted-foreground">Choose a style to preview it. Your selected template is applied when exporting the captioned video.</p>
              </div>
            </Card>
            <Card className="border-border/80 p-5">
              <div className="flex items-center gap-2 font-semibold"><Sparkles className="size-4 text-primary" /> Free by design</div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground"><li>• No paid caption API</li><li>• Speech recognition runs on your device</li><li>• Editable transcript and SRT download</li><li>• Styled WebM video export supported by your browser</li></ul>
            </Card>
          </div>
        </div>
        <canvas ref={canvasRef} className="pointer-events-none fixed -left-[9999px] top-0" aria-hidden="true" />
      </main>
    </div>
  );
}
