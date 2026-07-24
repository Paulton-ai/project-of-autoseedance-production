import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { ToolNavbar } from "@/components/tools/ToolNavbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { useSession } from "@/lib/auth";
import { toast } from "sonner";
import { Film, Sparkles, Upload, X, Coins, Wand2, ArrowLeft, Loader2, Pencil, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tools/reel-studio")({
  component: ReelStudioPage,
  head: () => ({
    meta: [
      { title: "AI Reel Studio — Generate Short Videos with Voiceover | Auto Seedance" },
      {
        name: "description",
        content:
          "Turn any idea into a ready-to-publish short video. Pick a style, model, voiceover, captions, and get a finished 30s/60s/90s reel in minutes.",
      },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://autoseedance.site/tools/reel-studio" }],
  }),
});

const NICHES = [
  "Educational", "Documentary", "Real Stories", "Entertainment", "Finance",
  "Sports", "Cartoon/Kids", "Motivational", "Product/Ad", "Tech", "Food", "Travel",
] as const;

const STYLES = [
  "2D Animation", "3D Animation", "Anime / Ghibli", "Cutout Animation", "Claymation",
  "Chibi/Cartoon", "Pixel Art / 8-bit", "Comic Book", "Origami/Paper Craft", "Isometric",
  "Cinematic Realistic", "Noir", "Nature/Documentary", "Retro/VHS", "Vintage Film",
  "UGC Style", "Cyberpunk", "Neon/Synthwave", "Watercolor/Illustration", "Minimalist Flat",
  "Fantasy/Epic", "Horror/Dark", "Sketch/Hand-drawn",
] as const;

const MODELS = [
  { value: "wan-2.6", label: "Wan 2.5 / 2.6" },
  { value: "kling-2.6", label: "Kling 1.6 / 2.6" },
  { value: "veo-3", label: "Veo 3" },
  { value: "seedance-2", label: "Seedance 2.0" },
] as const;

const VOICES = [
  { value: "female-us", label: "Female — US English" },
  { value: "male-us", label: "Male — US English" },
  { value: "female-uk", label: "Female — UK English" },
  { value: "male-uk", label: "Male — UK English" },
] as const;

const MUSIC_MOODS = ["Upbeat", "Calm", "Dramatic", "Cinematic"] as const;
const CAPTION_STYLES = [
  { value: "karaoke", label: "Karaoke Word-Highlight (default)" },
  { value: "simple", label: "Simple Subtitle" },
  { value: "none", label: "None" },
] as const;

function ReelStudioPage() {
  const { user } = useSession();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState<string>("Educational");
  const [videoLength, setVideoLength] = useState<30 | 60 | 90>(30);
  const [style, setStyle] = useState<string>("Cinematic Realistic");
  const [aspect, setAspect] = useState<"portrait" | "landscape">("portrait");
  const [model, setModel] = useState<string>("seedance-2");
  const [quality, setQuality] = useState<"budget" | "premium">("budget");

  const [refImage, setRefImage] = useState<File | null>(null);
  const [refPreview, setRefPreview] = useState<string | null>(null);

  const [voiceover, setVoiceover] = useState(true);
  const [voice, setVoice] = useState<string>("female-us");
  const [music, setMusic] = useState(false);
  const [musicMood, setMusicMood] = useState<string>("Cinematic");
  const [captions, setCaptions] = useState(true);
  const [captionStyle, setCaptionStyle] = useState<string>("karaoke");

  type Scene = { id: number; duration: number; visual: string; voiceover: string };
  const [view, setView] = useState<"input" | "script">("input");
  const [generatingScript, setGeneratingScript] = useState(false);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [reelId, setReelId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const costEstimate = useMemo(() => {
    const base = quality === "premium" ? 80 : 40;
    return { base, total: base };
  }, [quality]);

  const handleRefUpload = (f: File | null) => {
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) {
      toast.error("Reference image must be under 8MB");
      return;
    }
    setRefImage(f);
    setRefPreview(URL.createObjectURL(f));
  };

  const canGenerate = topic.trim().length > 10;

  const buildMockScript = (): Scene[] => {
    // Placeholder script generator until Milestone 3 wires the edge function
    const sceneCount = videoLength === 30 ? 4 : videoLength === 60 ? 6 : 8;
    const perScene = Math.round(videoLength / sceneCount);
    const seed = topic.trim().replace(/\s+/g, " ");
    return Array.from({ length: sceneCount }).map((_, i) => ({
      id: i + 1,
      duration: perScene,
      visual: `Scene ${i + 1} — ${style} shot illustrating: "${seed.slice(0, 90)}${seed.length > 90 ? "…" : ""}" (${niche} niche).`,
      voiceover:
        i === 0
          ? `Hook: What if ${seed.split(".")[0].toLowerCase()}?`
          : i === sceneCount - 1
            ? `Call-to-action: Follow for more on ${niche.toLowerCase()}.`
            : `Beat ${i}: expand on the idea with a concrete, visual moment.`,
    }));
  };

  const handleGenerate = async () => {
    if (!user) {
      toast.error("Please sign in to generate reels");
      return;
    }
    if (!canGenerate) {
      toast.error("Describe your video idea (at least a sentence)");
      return;
    }
    setGeneratingScript(true);
    // Simulate script generation — real Anthropic call lands in Milestone 3
    await new Promise((r) => setTimeout(r, 900));
    setScenes(buildMockScript());
    setGeneratingScript(false);
    setView("script");
  };

  const updateScene = (id: number, patch: Partial<Scene>) => {
    setScenes((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const handleApproveScript = () => {
    toast.info("Video pipeline coming in Milestone 3");
  };

  return (
    <div className="min-h-screen bg-background">
      <ToolNavbar title="AI Reel Studio" />
      <main className="pt-20 pb-16">
        <div className="mx-auto max-w-6xl px-4">
          <Breadcrumb items={[{ name: "Tools", url: "/dashboard" }, { name: "Reel Studio", url: "/tools/reel-studio" }]} />

          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="size-10 rounded-xl btn-gradient grid place-items-center">
                  <Film className="size-5 text-white" />
                </span>
                <h1 className="text-3xl md:text-4xl font-display font-bold">AI Reel Studio</h1>
                <Badge variant="secondary" className="ml-2">Beta</Badge>
              </div>
              <p className="text-muted-foreground max-w-2xl">
                Describe an idea, pick a style, and get a finished short video with voiceover,
                captions, and scenes merged automatically.
              </p>
            </div>
          </div>

          {view === "script" ? (
            <ScriptReview
              scenes={scenes}
              editingId={editingId}
              setEditingId={setEditingId}
              updateScene={updateScene}
              onBack={() => setView("input")}
              onApprove={handleApproveScript}
              totalLength={videoLength}
              totalCredits={costEstimate.total}
            />
          ) : (
          <div className="grid lg:grid-cols-[1fr_320px] gap-6">

            <div className="space-y-6">
              {/* Section A — Core Idea */}
              <Card className="p-6">
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" /> Core Idea
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="topic">Video Idea / Prompt</Label>
                    <Textarea
                      id="topic"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Describe your video idea..."
                      rows={4}
                      className="mt-2"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Niche</Label>
                      <Select value={niche} onValueChange={setNiche}>
                        <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {NICHES.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Video Length</Label>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {[30, 60, 90].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setVideoLength(s as 30 | 60 | 90)}
                            className={cn(
                              "px-3 py-2 rounded-md border text-sm font-medium transition",
                              videoLength === s
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border hover:border-primary/50",
                            )}
                          >
                            {s}s
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Section B — Visual Setup */}
              <Card className="p-6">
                <h2 className="font-semibold mb-4">Visual Setup</h2>
                <div className="space-y-5">
                  <div>
                    <Label>Style</Label>
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {STYLES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStyle(s)}
                          className={cn(
                            "px-3 py-3 rounded-lg border text-xs font-medium text-left transition",
                            style === s
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:border-primary/50 text-foreground/80",
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <Label>Aspect Ratio</Label>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {(["portrait", "landscape"] as const).map((a) => (
                          <button
                            key={a}
                            type="button"
                            onClick={() => setAspect(a)}
                            className={cn(
                              "px-3 py-2 rounded-md border text-sm font-medium transition",
                              aspect === a
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border hover:border-primary/50",
                            )}
                          >
                            {a === "portrait" ? "9:16" : "16:9"}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>AI Model</Label>
                      <Select value={model} onValueChange={setModel}>
                        <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {MODELS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Quality Mode</Label>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {(["budget", "premium"] as const).map((q) => (
                          <button
                            key={q}
                            type="button"
                            onClick={() => setQuality(q)}
                            className={cn(
                              "px-3 py-2 rounded-md border text-sm font-medium capitalize transition",
                              quality === q
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border hover:border-primary/50",
                            )}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Section C — Character/Branding */}
              <Card className="p-6">
                <h2 className="font-semibold mb-1">Character / Branding <span className="text-xs font-normal text-muted-foreground">(optional)</span></h2>
                <p className="text-xs text-muted-foreground mb-3">
                  Upload a reference image to help keep a character/product consistent across scenes
                  (best-effort, not guaranteed 100% consistent).
                </p>
                {refPreview ? (
                  <div className="relative inline-block">
                    <img src={refPreview} alt="ref" className="h-32 rounded-lg border border-border" />
                    <button
                      type="button"
                      onClick={() => { setRefImage(null); setRefPreview(null); }}
                      className="absolute -top-2 -right-2 size-6 rounded-full bg-background border border-border grid place-items-center"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full h-28 rounded-lg border-2 border-dashed border-border hover:border-primary/50 grid place-items-center text-sm text-muted-foreground transition"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Upload className="size-5" />
                      <span>Click to upload reference image</span>
                    </div>
                  </button>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleRefUpload(e.target.files?.[0] ?? null)}
                />
              </Card>

              {/* Section D — Audio */}
              <Card className="p-6">
                <h2 className="font-semibold mb-4">Audio</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Voiceover</Label>
                      <p className="text-xs text-muted-foreground">AI-generated narration over your reel</p>
                    </div>
                    <Switch checked={voiceover} onCheckedChange={setVoiceover} />
                  </div>
                  {voiceover && (
                    <div>
                      <Label>Voice</Label>
                      <Select value={voice} onValueChange={setVoice}>
                        <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {VOICES.map((v) => <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div>
                      <Label>Background Music</Label>
                      <p className="text-xs text-muted-foreground">Adds a mood-matching soundtrack</p>
                    </div>
                    <Switch checked={music} onCheckedChange={setMusic} />
                  </div>
                  {music && (
                    <div>
                      <Label>Mood</Label>
                      <Select value={musicMood} onValueChange={setMusicMood}>
                        <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {MUSIC_MOODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </Card>

              {/* Section E — Captions */}
              <Card className="p-6">
                <h2 className="font-semibold mb-4">Captions</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto Captions</Label>
                      <p className="text-xs text-muted-foreground">Burn in subtitles synced to the voiceover</p>
                    </div>
                    <Switch checked={captions} onCheckedChange={setCaptions} />
                  </div>
                  {captions && (
                    <div>
                      <Label>Caption Style</Label>
                      <Select value={captionStyle} onValueChange={setCaptionStyle}>
                        <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {CAPTION_STYLES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Sticky sidebar — Cost & Generate */}
            <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Coins className="size-4 text-primary" /> Cost Estimate
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quality mode</span>
                    <span className="capitalize font-medium">{quality}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Video length</span>
                    <span className="font-medium">{videoLength}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Voiceover</span>
                    <span className="font-medium">{voiceover ? "On" : "Off"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Captions</span>
                    <span className="font-medium">{captions ? "On" : "Off"}</span>
                  </div>
                  <div className="border-t border-border my-3" />
                  <div className="flex justify-between items-baseline">
                    <span className="text-muted-foreground">Total</span>
                    <span className="text-2xl font-bold gradient-text">{costEstimate.total}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">credits per reel</p>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={!canGenerate || generatingScript}
                  className="w-full mt-5 btn-gradient text-white"
                  size="lg"
                >
                  {generatingScript ? (
                    <><Loader2 className="size-4 mr-2 animate-spin" /> Writing script…</>
                  ) : (
                    <><Wand2 className="size-4 mr-2" /> Generate Script</>
                  )}
                </Button>
                {!user && (
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    Sign in required to generate
                  </p>
                )}
              </Card>

              <Card className="p-4 bg-muted/30">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Transparent pricing:</strong> credits are only
                  deducted when generation starts. Failed generations are refunded automatically.
                </p>
              </Card>
            </aside>
          </div>
          )}
        </div>

      </main>
    </div>
  );
}

function ScriptReview({
  scenes,
  editingId,
  setEditingId,
  updateScene,
  onBack,
  onApprove,
  totalLength,
  totalCredits,
}: {
  scenes: { id: number; duration: number; visual: string; voiceover: string }[];
  editingId: number | null;
  setEditingId: (id: number | null) => void;
  updateScene: (id: number, patch: Partial<{ id: number; duration: number; visual: string; voiceover: string }>) => void;
  onBack: () => void;
  onApprove: () => void;
  totalLength: number;
  totalCredits: number;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="size-4" /> Back to inputs
        </Button>
        <div className="text-sm text-muted-foreground">
          {scenes.length} scenes · {totalLength}s total
        </div>
      </div>

      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-xl font-display font-bold">Review your script</h2>
          <p className="text-sm text-muted-foreground">
            Edit any scene before we render the video. Voiceover is what viewers will hear;
            visual describes what will be generated on screen.
          </p>
        </div>

        <div className="space-y-4">
          {scenes.map((s) => {
            const isEditing = editingId === s.id;
            return (
              <div key={s.id} className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="size-7 rounded-md bg-primary/10 text-primary text-xs font-semibold grid place-items-center">
                      {s.id}
                    </span>
                    <span className="text-sm font-medium">Scene {s.id}</span>
                    <Badge variant="secondary">{s.duration}s</Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingId(isEditing ? null : s.id)}
                    className="gap-1"
                  >
                    {isEditing ? (<><Check className="size-3" /> Done</>) : (<><Pencil className="size-3" /> Edit</>)}
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Visual</Label>
                    {isEditing ? (
                      <Textarea
                        value={s.visual}
                        onChange={(e) => updateScene(s.id, { visual: e.target.value })}
                        rows={3}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-sm mt-1 text-foreground/80">{s.visual}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">Voiceover</Label>
                    {isEditing ? (
                      <Textarea
                        value={s.voiceover}
                        onChange={(e) => updateScene(s.id, { voiceover: e.target.value })}
                        rows={3}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-sm mt-1 text-foreground/80">{s.voiceover}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-sm text-muted-foreground">Total cost to render</div>
          <div className="text-2xl font-bold gradient-text">{totalCredits} credits</div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>Edit inputs</Button>
          <Button onClick={onApprove} className="btn-gradient text-white gap-2">
            <Wand2 className="size-4" /> Approve & Generate Video
          </Button>
        </div>
      </Card>
    </div>
  );
}
