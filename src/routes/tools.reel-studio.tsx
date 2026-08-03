import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ToolNavbar } from "@/components/tools/ToolNavbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VOICE_GROUPS, voiceValue, DEFAULT_VOICE } from "@/lib/reel-voices";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { useSession } from "@/lib/auth";
import { toast } from "sonner";
import { Film, Sparkles, Upload, X, Coins, Wand2, ArrowLeft, Loader2, Pencil, Check, Download, Link as LinkIcon } from "lucide-react";
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
  const [voice, setVoice] = useState<string>(DEFAULT_VOICE);
  const [music, setMusic] = useState(false);
  const [musicMood, setMusicMood] = useState<string>("Cinematic");
  const [captions, setCaptions] = useState(true);
  const [captionStyle, setCaptionStyle] = useState<string>("karaoke");

  type Scene = { id: number; duration: number; visual: string; voiceover: string };
  type SceneClip = Scene & {
    status: "processing" | "completed" | "failed";
    video_url?: string;
    error?: string;
    model_id?: string;
  };
  const [view, setView] = useState<"input" | "script" | "clips" | "final">("input");
  const [generatingScript, setGeneratingScript] = useState(false);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [reelId, setReelId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [clips, setClips] = useState<SceneClip[]>([]);
  const [clipsStatus, setClipsStatus] = useState<string>("");
  const [submittingClips, setSubmittingClips] = useState(false);
  const [finalUrl, setFinalUrl] = useState<string | null>(null);
  const [captioning, setCaptioning] = useState(false);
  const [blockedScenes, setBlockedScenes] = useState<number[]>([]);
  const autoRetried = useRef<Set<number>>(new Set());
  const resumed = useRef(false);

  // Resume an in-progress reel when the user comes back to this page.
  useEffect(() => {
    if (!user || resumed.current) return;
    resumed.current = true;
    (async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data } = await supabase
        .from("reel_generations")
        .select("*")
        .eq("user_id", user.id)
        .not("status", "in", "(completed,draft)")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      const reel = data as Record<string, any> | null;
      if (!reel) return;
      const savedScenes = (reel.script?.scenes ?? []) as Scene[];
      if (!savedScenes.length) return;
      setReelId(reel.id);
      setScenes(savedScenes);
      setTopic(reel.topic ?? "");
      setNiche(reel.niche ?? "Educational");
      setVideoLength((reel.video_length ?? 30) as 30 | 60 | 90);
      setStyle(reel.style ?? "Cinematic Realistic");
      setAspect((reel.aspect ?? "portrait") as "portrait" | "landscape");
      setModel(reel.model ?? "seedance-2");
      setQuality((reel.quality ?? "budget") as "budget" | "premium");
      setVoiceover(!!reel.voiceover);
      setCaptions(!!reel.captions);
      setCaptionStyle(reel.caption_style ?? "karaoke");
      const assets = (reel.scene_assets ?? []) as SceneClip[];
      if (reel.final_video_url) {
        setFinalUrl(reel.final_video_url);
        setView("final");
      } else if (assets.length) {
        setClips(assets);
        setBlockedScenes(assets.filter((a) => a.status === "failed").map((a) => a.id));
        setClipsStatus("Resumed your in-progress reel — completed scenes were saved.");
        setView("clips");
      } else {
        setView("script");
      }
      toast.info("Resumed your in-progress reel");
    })();
  }, [user]);



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
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.functions.invoke("generate-reel-script", {
        body: {
          topic,
          niche,
          video_length: videoLength,
          style,
          aspect,
          model,
          quality,
          voiceover,
          voice,
          music,
          music_mood: musicMood,
          captions,
          caption_style: captionStyle,
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Script generation failed");
      setScenes(data.scenes as Scene[]);
      setReelId(data.reel_id as string);
      setView("script");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(`Failed to generate script: ${msg}`);
    } finally {
      setGeneratingScript(false);
    }
  };

  const updateScene = (id: number, patch: Partial<Scene>) => {
    setScenes((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const finalizeReel = async () => {
    if (!reelId) return;
    const { supabase } = await import("@/integrations/supabase/client");

    if (voiceover) {
      setClipsStatus("Generating voiceover narration…");
      const { data: vo, error: voErr } = await supabase.functions.invoke("generate-reel-voiceover", {
        body: { reel_id: reelId },
      });
      if (voErr) throw voErr;
      if (!vo?.success) throw new Error(vo?.error || "Voiceover generation failed");
      if (vo.failed) toast.error(`${vo.failed} scene narration(s) failed — merging without them`);
    }

    setClipsStatus("Merging scenes into the final video…");
    const { data: submit, error: submitErr } = await supabase.functions.invoke("merge-reel-video", {
      body: { reel_id: reelId, action: "submit" },
    });
    if (submitErr) throw submitErr;
    if (!submit?.success) throw new Error(submit?.error || "Merge failed to start");

    const pollMerge = async (): Promise<void> => {
      await new Promise((r) => setTimeout(r, 5000));
      const { data: pd, error: pe } = await supabase.functions.invoke("merge-reel-video", {
        body: { reel_id: reelId, action: "poll" },
      });
      if (pe) throw pe;
      if (!pd?.success) throw new Error(pd?.error || "Merge poll failed");
      if (pd.status === "completed") {
        setFinalUrl(pd.final_video_url as string);
        setView("final");
        toast.success("Your reel is ready");
        if (captions && captionStyle !== "none") await burnCaptions();
        return;
      }
      if (pd.status === "failed") throw new Error(pd.error || "Merge failed");
      return pollMerge();
    };
    await pollMerge();
  };

  const burnCaptions = async () => {
    if (!reelId) return;
    const { supabase } = await import("@/integrations/supabase/client");
    try {
      setCaptioning(true);
      const { data: submit, error: subErr } = await supabase.functions.invoke("caption-reel-video", {
        body: { reel_id: reelId, action: "submit" },
      });
      if (subErr) throw subErr;
      if (!submit?.success) throw new Error(submit?.error || "Captioning failed to start");
      if (submit.status === "skipped") return;
      const requestId = submit.request_id as string;

      const pollCaptions = async (): Promise<void> => {
        await new Promise((r) => setTimeout(r, 5000));
        const { data: pd, error: pe } = await supabase.functions.invoke("caption-reel-video", {
          body: { reel_id: reelId, action: "poll", request_id: requestId },
        });
        if (pe) throw pe;
        if (!pd?.success) throw new Error(pd?.error || "Caption poll failed");
        if (pd.status === "completed") {
          setFinalUrl(pd.final_video_url as string);
          toast.success("Captions added");
          return;
        }
        if (pd.status === "failed") throw new Error(pd.error || "Captioning failed");
        return pollCaptions();
      };
      await pollCaptions();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(`Captions skipped: ${msg}`);
    } finally {
      setCaptioning(false);
    }
  };


  // Submits (or re-submits) scene clips. Completed scenes are never resubmitted
  // or re-charged — the edge function filters them out server-side.
  const runClips = async (sceneIds?: number[]) => {
    if (!reelId) {
      toast.error("Missing reel id — regenerate the script");
      return;
    }
    setSubmittingClips(true);
    setBlockedScenes([]);
    setClipsStatus(
      sceneIds?.length
        ? `Retrying scene ${sceneIds.join(", ")}…`
        : "Submitting scene clips to Fal.ai…",
    );
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: submitData, error: submitErr } = await supabase.functions.invoke("generate-reel-clips", {
        body: { reel_id: reelId, scenes, ...(sceneIds?.length ? { scene_ids: sceneIds } : {}) },
      });
      if (submitErr) throw submitErr;
      if (!submitData?.success) throw new Error(submitData?.error || "Failed to submit scene clips");
      setClips(submitData.scenes as SceneClip[]);
      setView("clips");

      // Poll until nothing is processing anymore
      const poll = async (): Promise<SceneClip[]> => {
        const { data: pd, error: pe } = await supabase.functions.invoke("poll-reel-clips", {
          body: { reel_id: reelId },
        });
        if (pe) throw pe;
        if (!pd?.success) throw new Error(pd?.error || "Poll failed");
        const list = pd.scenes as SceneClip[];
        setClips(list);
        const { total, completed, failed, processing } = pd.progress;
        setClipsStatus(`Rendering: ${completed}/${total} completed · ${processing} processing · ${failed} failed`);
        if (processing === 0) return list;
        await new Promise((r) => setTimeout(r, 5000));
        return poll();
      };

      let list = await poll();

      // Automatic single retry for any failed scene
      let failedIds = list.filter((c) => c.status === "failed").map((c) => c.id);
      const toAutoRetry = failedIds.filter((id) => !autoRetried.current.has(id));
      if (toAutoRetry.length) {
        toAutoRetry.forEach((id) => autoRetried.current.add(id));
        setClipsStatus(`Retrying failed scene${toAutoRetry.length > 1 ? "s" : ""} ${toAutoRetry.join(", ")}…`);
        const { data: rd, error: re } = await supabase.functions.invoke("generate-reel-clips", {
          body: { reel_id: reelId, scenes, scene_ids: toAutoRetry },
        });
        if (re) throw re;
        if (!rd?.success) throw new Error(rd?.error || "Retry failed");
        setClips(rd.scenes as SceneClip[]);
        list = await poll();
        failedIds = list.filter((c) => c.status === "failed").map((c) => c.id);
      }

      // Hard gate: never merge unless every scene completed
      if (failedIds.length) {
        setBlockedScenes(failedIds);
        setClipsStatus(
          `Scene ${failedIds.join(", ")} failed to generate. Retry ${failedIds.length > 1 ? "them" : "it"} to continue — completed scenes are saved and won't be charged again.`,
        );
        toast.error(`Scene ${failedIds.join(", ")} failed to generate`);
        return;
      }

      toast.success("All scene clips generated");
      await finalizeReel();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(`Video generation failed: ${msg}`);
    } finally {
      setSubmittingClips(false);
    }
  };

  const handleApproveScript = () => runClips();



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

          {view === "final" && finalUrl ? (
            <FinalResult
              url={finalUrl}
              aspect={aspect}
              onNew={() => {
                setFinalUrl(null);
                setClips([]);
                setScenes([]);
                setReelId(null);
                setView("input");
              }}
              onBackToClips={() => setView("clips")}
              captioning={captioning}
            />
          ) : view === "clips" ? (
            <ClipsProgress
              clips={clips}
              statusLine={clipsStatus}
              submitting={submittingClips}
              aspect={aspect}
              blockedScenes={blockedScenes}
              onRetryScene={(id) => runClips([id])}
              onRetryAll={() => runClips(blockedScenes)}
              onBack={() => setView("script")}
            />

          ) : view === "script" ? (
            <ScriptReview
              scenes={scenes}
              editingId={editingId}
              setEditingId={setEditingId}
              updateScene={updateScene}
              onBack={() => setView("input")}
              onApprove={handleApproveScript}
              approving={submittingClips}
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
                        <SelectTrigger className="mt-2"><SelectValue placeholder="Select a voice" /></SelectTrigger>
                        <SelectContent className="max-h-72">
                          {VOICE_GROUPS.map((g) => (
                            <SelectGroup key={g.code}>
                              <SelectLabel>{g.language}</SelectLabel>
                              {g.names.map((n) => {
                                const val = voiceValue(n, g.code);
                                return <SelectItem key={val} value={val}>{n}</SelectItem>;
                              })}
                            </SelectGroup>
                          ))}
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
  approving,
  totalLength,
  totalCredits,
}: {
  scenes: { id: number; duration: number; visual: string; voiceover: string }[];
  editingId: number | null;
  setEditingId: (id: number | null) => void;
  updateScene: (id: number, patch: Partial<{ id: number; duration: number; visual: string; voiceover: string }>) => void;
  onBack: () => void;
  onApprove: () => void;
  approving?: boolean;
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
          <Button variant="outline" onClick={onBack} disabled={approving}>Edit inputs</Button>
          <Button onClick={onApprove} disabled={approving} className="btn-gradient text-white gap-2">
            {approving ? (<><Loader2 className="size-4 animate-spin" /> Submitting…</>) : (<><Wand2 className="size-4" /> Approve & Generate Video</>)}
          </Button>

        </div>
      </Card>
    </div>
  );
}

function ClipsProgress({
  clips,
  statusLine,
  submitting,
  aspect,
  blockedScenes,
  onRetryScene,
  onRetryAll,
  onBack,
}: {
  clips: {
    id: number;
    duration: number;
    visual: string;
    voiceover: string;
    status: "processing" | "completed" | "failed" | "pending";
    video_url?: string;
    error?: string;
    model_id?: string;
  }[];
  statusLine: string;
  submitting: boolean;
  aspect: "portrait" | "landscape";
  blockedScenes: number[];
  onRetryScene: (id: number) => void;
  onRetryAll: () => void;
  onBack: () => void;
}) {
  const total = clips.length;
  const completed = clips.filter((c) => c.status === "completed").length;
  const failed = clips.filter((c) => c.status === "failed").length;
  const processing = total - completed - failed;

  // Compact photo-grid: everything fits one screen for 4, 6 or 8 scenes
  const rows = total <= 4 ? 1 : 2;
  const cols = Math.max(1, Math.ceil(total / rows));
  const ratio = aspect === "portrait" ? "9 / 16" : "16 / 9";
  const tileMaxHeight = `calc((100vh - 24rem) / ${rows})`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2" disabled={submitting}>
          <ArrowLeft className="size-4" /> Back to script
        </Button>
        <div className="text-sm text-muted-foreground">
          {completed}/{total} clips · {processing} rendering · {failed} failed
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-lg font-display font-bold leading-tight">Rendering scene clips</h2>
            <p className="text-xs text-muted-foreground">{statusLine}</p>
          </div>
          {blockedScenes.length > 0 && (
            <Button onClick={onRetryAll} disabled={submitting} className="btn-gradient text-white gap-2" size="sm">
              {submitting ? <Loader2 className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
              Retry failed scene{blockedScenes.length > 1 ? "s" : ""}
            </Button>
          )}
        </div>

        <div
          className="grid gap-2 justify-center"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {clips.map((c) => (
            <div
              key={c.id}
              className="relative rounded-lg border border-border overflow-hidden bg-muted mx-auto w-full"
              style={{ aspectRatio: ratio, maxHeight: tileMaxHeight }}
            >
              {c.status === "completed" && c.video_url ? (
                <video src={c.video_url} controls muted playsInline className="w-full h-full object-cover" />
              ) : c.status === "failed" ? (
                <div className="w-full h-full grid place-items-center text-center p-2 text-[11px] text-destructive">
                  <div>
                    <X className="size-5 mx-auto mb-1" />
                    Failed
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={submitting}
                      onClick={() => onRetryScene(c.id)}
                      className="mt-2 h-7 px-2 text-[11px]"
                    >
                      Retry this scene
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full grid place-items-center">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              )}
              <span
                className={cn(
                  "absolute top-1 left-1 rounded px-1.5 py-0.5 text-[10px] font-medium bg-background/80 backdrop-blur",
                  c.status === "completed" && "text-emerald-600",
                  c.status === "failed" && "text-destructive",
                )}
              >
                {c.id} · {c.duration}s
              </span>
            </div>
          ))}
        </div>

        {blockedScenes.length > 0 && (
          <p className="mt-3 text-xs text-destructive">
            Scene {blockedScenes.join(", ")} failed to generate. Merging is paused until every scene
            completes — already-rendered scenes are saved and won't be charged again.
          </p>
        )}
      </Card>
    </div>

  );
}


function FinalResult({
  url,
  aspect,
  onNew,
  onBackToClips,
  captioning = false,
}: {
  url: string;
  aspect: "portrait" | "landscape";
  onNew: () => void;
  onBackToClips: () => void;
  captioning?: boolean;
}) {
  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    toast.success("Video link copied");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBackToClips} className="gap-2">
          <ArrowLeft className="size-4" /> Back to scenes
        </Button>
        {captioning ? (
          <Badge variant="secondary" className="gap-2">
            <Loader2 className="size-3 animate-spin" /> Burning captions…
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-600">Completed</Badge>
        )}
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-display font-bold mb-1">Your reel is ready</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {captioning
            ? "Playing the merged cut — captions are being burned in and will swap in automatically."
            : "Scenes merged with narration and captions. Download it or copy the link to share."}
        </p>

        <div className="flex justify-center">
          <video
            src={url}
            controls
            playsInline
            className={cn(
              "rounded-xl border border-border bg-black w-full",
              aspect === "portrait" ? "max-w-[360px] aspect-[9/16]" : "max-w-[720px] aspect-video",
            )}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          <Button asChild className="btn-gradient text-white gap-2">
            <a href={url} download target="_blank" rel="noreferrer">
              <Download className="size-4" /> Download video
            </a>
          </Button>
          <Button variant="outline" onClick={copyLink} className="gap-2">
            <LinkIcon className="size-4" /> Copy link
          </Button>
          <Button variant="outline" onClick={onNew} className="gap-2">
            <Wand2 className="size-4" /> Create another reel
          </Button>
        </div>
      </Card>
    </div>
  );
}
