import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ToolNavbar } from "@/components/tools/ToolNavbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { Video, Loader as Loader2, Download, Heart, Trash2, Sparkles, X, Image as ImageIcon, Music, ArrowLeft, Circle as HelpCircle, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/tools/video")({
  component: VideoToolPage,
  head: () => ({
    meta: [
      { title: "Free AI Video Generator — Create AI Videos Online | Auto Seedance" },
      { name: "description", content: "Generate cinematic AI videos for free with Auto Seedance. Text to video AI generator with 720p-1080p resolution, AI-generated audio, and multiple aspect ratios. 30 credits per video. Start with 50 free credits." },
      { name: "keywords", content: "AI Video Generator, Free AI Video Generator, AI Video Creator, AI Video Maker, text to video, Veo 3, Google Veo, AI Video Generator Online, AI Video Generator Free, cinematic AI videos" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-video-preview:-1" },
      { property: "og:title", content: "Free AI Video Generator — Create AI Videos Online" },
      { property: "og:description", content: "Generate cinematic AI videos for free. 720p-1080p with AI audio. 30 credits per video." },
      { property: "og:url", content: "https://autoseedance.site/tools/video" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://autoseedance.site/og-image.png" },
      { property: "og:image:alt", content: "AI Video Generator - Create cinematic videos from text prompts" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Free AI Video Generator — Auto Seedance" },
      { name: "twitter:description", content: "Generate cinematic AI videos for free. 720p-1080p with AI audio." },
      { name: "twitter:image", content: "https://autoseedance.site/og-image.png" },
    ],
    links: [{ rel: "canonical", href: "https://autoseedance.site/tools/video" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: "AI Video Generation",
          description: "Create cinematic AI videos from text prompts with 720p-1080p resolution and AI-generated audio.",
          url: "https://autoseedance.site/tools/video",
          provider: { "@type": "Organization", name: "Auto Seedance" },
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          aggregateRating: { "@type": "AggregateRating", ratingValue: "4.7", ratingCount: "420" },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Auto Seedance Video Generator",
          applicationCategory: "VideoApplication",
          description: "AI-powered video generation tool for creating cinematic content from text descriptions.",
          operatingSystem: "Web Browser",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://autoseedance.site/" },
            { "@type": "ListItem", position: 2, name: "Tools", item: "https://autoseedance.site/tools" },
            { "@type": "ListItem", position: 3, name: "Video Generator", item: "https://autoseedance.site/tools/video" },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            { "@type": "Question", name: "How does the AI video generator work?", acceptedAnswer: { "@type": "Answer", text: "Describe your video scene with a text prompt, set duration (1-10 seconds), resolution (720p HD or 1080p Full HD), and aspect ratio (16:9, 9:16 for shorts, or 1:1 square). The AI creates a cinematic video in 2-3 minutes." } },
            { "@type": "Question", name: "Is the AI video generator free?", acceptedAnswer: { "@type": "Answer", text: "Yes, you start with 50 free credits. Each video costs 30 credits, giving you 1 free video to start. No credit card required." } },
            { "@type": "Question", name: "Can I add audio to my AI videos?", acceptedAnswer: { "@type": "Answer", text: "Yes, we offer AI-generated background audio that automatically matches your video's mood and content. You can also upload custom audio tracks." } },
            { "@type": "Question", name: "What video resolutions are supported?", acceptedAnswer: { "@type": "Answer", text: "We support 720p HD and 1080p Full HD resolutions. Aspect ratios include 16:9 (landscape), 9:16 (portrait/shorts), and 1:1 (square)." } },
            { "@type": "Question", name: "Can I use reference images or videos?", acceptedAnswer: { "@type": "Answer", text: "Yes, upload up to 9 reference images, 3 reference videos, and 3 audio tracks to guide the AI in creating your video." } },
          ],
        }),
      },
    ],
  }),
});

const RESOLUTIONS = [
  { value: "720p", label: "720p (HD)" },
  { value: "1080p", label: "1080p (Full HD)" },
];
const ASPECT_RATIOS = [
  { value: "16:9", label: "16:9 (Landscape)" },
  { value: "9:16", label: "9:16 (Portrait/Shorts)" },
  { value: "1:1", label: "1:1 (Square)" },
];
const CREDITS_PER_VIDEO = 30;
const MAX_PROMPT_LENGTH = 4000;
type Generation = Tables<"generations">;

type QueueStatus = "queued" | "generating" | "done" | "failed";

interface QueueItem {
  id: string;
  prompt: string;
  duration: number;
  resolution: string;
  aspectRatio: string;
  status: QueueStatus;
  progress: number;
  startTime: number;
  videoUrl: string | null;
  error?: string;
}

function QueueItemCard({
  item,
  onDismiss,
}: {
  item: QueueItem;
  onDismiss: (id: string) => void;
}) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (item.status !== "generating") return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - item.startTime) / 1000)), 1000);
    return () => clearInterval(t);
  }, [item.status, item.startTime]);

  const statusText =
    item.status === "queued" ? "Queued" :
    item.status === "generating" ? (elapsed < 60 ? `Generating… (${elapsed}s)` : elapsed < 120 ? `Almost ready… (${elapsed}s)` : `Still working… (${elapsed}s)`) :
    item.status === "done" ? "Done!" :
    "Failed";

  const statusColor =
    item.status === "done" ? "text-green-500" :
    item.status === "failed" ? "text-red-500" :
    "text-muted-foreground";

  return (
    <Card className="glass border-0 p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-sm line-clamp-2 flex-1">{item.prompt}</p>
        {(item.status === "done" || item.status === "failed") && (
          <button onClick={() => onDismiss(item.id)} className="shrink-0 text-muted-foreground hover:text-foreground transition">
            <X className="size-4" />
          </button>
        )}
      </div>

      {(item.status === "queued" || item.status === "generating") && (
        <Progress value={item.status === "queued" ? undefined : item.progress} className="h-1.5 mb-2" />
      )}

      <div className={`flex items-center gap-1.5 text-xs ${statusColor} mb-3`}>
        {(item.status === "queued" || item.status === "generating") && <Loader2 className="size-3 animate-spin" />}
        {item.status === "done" && <CheckCircle className="size-3" />}
        {item.status === "failed" && <AlertCircle className="size-3" />}
        <span>{statusText}</span>
        <div className="ml-auto flex gap-1">
          <Badge variant="outline" className="text-[9px] px-1 py-0">{item.duration}s</Badge>
          <Badge variant="outline" className="text-[9px] px-1 py-0">{item.resolution}</Badge>
          <Badge variant="outline" className="text-[9px] px-1 py-0">{item.aspectRatio}</Badge>
        </div>
      </div>

      {item.status === "done" && item.videoUrl && (
        <div className="rounded-lg overflow-hidden border border-border">
          <video src={item.videoUrl} controls className="w-full" />
          <div className="p-2 flex justify-end">
            <Button size="sm" variant="outline" asChild>
              <a href={item.videoUrl} download target="_blank" rel="noopener noreferrer">
                <Download className="size-3.5 mr-1.5" /> Download
              </a>
            </Button>
          </div>
        </div>
      )}

      {item.status === "failed" && item.error && (
        <p className="text-xs text-red-500">{item.error}</p>
      )}
    </Card>
  );
}

function VideoToolPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("text");
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState(5);
  const [resolution, setResolution] = useState("720p");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [generateAudio, setGenerateAudio] = useState(true);
  const [referenceImageUrls, setReferenceImageUrls] = useState<string[]>([]);
  const [referenceVideoUrls, setReferenceVideoUrls] = useState<string[]>([]);
  const [referenceAudioUrls, setReferenceAudioUrls] = useState<string[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const intervalsRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());

  const [authGateOpen, setAuthGateOpen] = useState(false);
  const [creditsDialog, setCreditsDialog] = useState<{ open: boolean; balance: number }>({ open: false, balance: 0 });

  useEffect(() => {
    const loadUser = (uid: string) => {
      setUserId(uid);
      supabase.from("user_roles").select("role").eq("user_id", uid).eq("role", "admin").maybeSingle()
        .then(({ data }) => setIsAdmin(!!data));
    };
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) loadUser(user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) loadUser(session.user.id);
      else { setUserId(null); setIsAdmin(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function fetchGenerations(uid: string) {
    const { data } = await supabase.from("generations").select("*").eq("user_id", uid).eq("tool_type", "video").order("created_at", { ascending: false }).limit(30);
    setGenerations((data as Generation[]) ?? []);
  }

  useEffect(() => {
    if (!userId) return;
    fetchGenerations(userId);
    return () => { intervalsRef.current.forEach((id) => clearInterval(id)); };
  }, [userId]);

  const updateQueueItem = useCallback((id: string, patch: Partial<QueueItem>) => {
    setQueue((prev) => prev.map((item) => item.id === id ? { ...item, ...patch } : item));
  }, []);

  const dismissQueueItem = useCallback((id: string) => {
    const interval = intervalsRef.current.get(id);
    if (interval) { clearInterval(interval); intervalsRef.current.delete(id); }
    setQueue((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string[]>>, max: number, current: number) => {
    const files = e.target.files; if (!files) return;
    Array.from(files).forEach((file) => {
      if (current >= max) { toast.error(`Maximum ${max} files`); return; }
      if (file.size > 50 * 1024 * 1024) { toast.error("File too large (max 50MB)"); return; }
      const reader = new FileReader();
      reader.onload = (ev) => { const b = ev.target?.result as string; if (b) setter((prev) => [...prev, b]); };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) { toast.error("Please enter a prompt"); return; }
    if (!userId) { setAuthGateOpen(true); return; }

    if (!isAdmin) {
      const { data: wallet } = await supabase.from("credit_wallets").select("balance").eq("user_id", userId).maybeSingle();
      if (wallet && wallet.balance < CREDITS_PER_VIDEO) {
        setCreditsDialog({ open: true, balance: wallet.balance });
        return;
      }
    }

    const itemId = crypto.randomUUID();
    const capturedPrompt = prompt.trim();
    const capturedDuration = duration;
    const capturedResolution = resolution;
    const capturedAspectRatio = aspectRatio;
    const capturedAudio = generateAudio;
    const capturedTab = activeTab;
    const capturedRefImages = capturedTab === "reference" ? [...referenceImageUrls] : [];
    const capturedRefVideos = capturedTab === "reference" ? [...referenceVideoUrls] : [];
    const capturedRefAudio = capturedTab === "reference" ? [...referenceAudioUrls] : [];

    const newItem: QueueItem = {
      id: itemId,
      prompt: capturedPrompt,
      duration: capturedDuration,
      resolution: capturedResolution,
      aspectRatio: capturedAspectRatio,
      status: "queued",
      progress: 0,
      startTime: Date.now(),
      videoUrl: null,
    };
    setQueue((prev) => [newItem, ...prev]);

    (async () => {
      try {
        if (!isAdmin) {
          const { data, error: creditError } = await supabase.rpc("consume_credits", { _tool: "video", _amount: CREDITS_PER_VIDEO });
          const d = data as { success?: boolean; error?: string } | null;
          if (creditError || !d?.success) throw new Error(d?.error || creditError?.message || "Failed to deduct credits");
        }

        updateQueueItem(itemId, { status: "generating", startTime: Date.now() });

        const { data, error } = await supabase.functions.invoke("generate-video", {
          body: {
            prompt: capturedPrompt,
            resolution: capturedResolution || "720p",
            duration: capturedDuration || "10",
            aspect_ratio: capturedAspectRatio || "auto",
            generate_audio: capturedAudio ?? true,
            image_urls: capturedRefImages,
            video_urls: capturedRefVideos,
            audio_urls: capturedRefAudio,
          },
        });
        if (error) throw new Error(error.message);
        if (data?.error) throw new Error(data.error);

        const { status_url, response_url } = data;
        let pollCount = 0;

        const intervalId = setInterval(async () => {
          pollCount++;
          updateQueueItem(itemId, { progress: Math.min(pollCount * 2.5, 90) });

          if (pollCount > 40) {
            clearInterval(intervalId);
            intervalsRef.current.delete(itemId);
            updateQueueItem(itemId, { status: "failed", error: "Generation timed out — please try again" });
            return;
          }
          try {
            const { data: pollData, error: pollError } = await supabase.functions.invoke("poll-generation", {
              body: { status_url, response_url },
            });
            if (pollError) return;

            if (pollData?.status === "completed" && pollData?.video_url) {
              clearInterval(intervalId);
              intervalsRef.current.delete(itemId);
              updateQueueItem(itemId, { status: "done", progress: 100, videoUrl: pollData.video_url });

              await supabase.from("generations").insert({
                user_id: userId, tool_type: "video", prompt: capturedPrompt,
                settings: { duration: capturedDuration, resolution: capturedResolution, aspect_ratio: capturedAspectRatio, generate_audio: capturedAudio },
                status: "done", result_url: pollData.video_url, thumbnail_url: pollData.video_url, credits_used: CREDITS_PER_VIDEO,
              });
              if (userId) fetchGenerations(userId);
              toast.success("Your video is ready!");
            }

            if (pollData?.status === "failed") {
              clearInterval(intervalId);
              intervalsRef.current.delete(itemId);
              updateQueueItem(itemId, { status: "failed", error: pollData?.error || "Video generation failed" });
            }
          } catch {
            // poll error — retry next tick
          }
        }, 5000);

        intervalsRef.current.set(itemId, intervalId);
      } catch (e: unknown) {
        updateQueueItem(itemId, { status: "failed", error: e instanceof Error ? e.message : "Generation failed" });
      }
    })();
  };

  async function toggleFavorite(id: string, current: boolean) {
    await supabase.from("generations").update({ is_favorite: !current }).eq("id", id);
    if (userId) fetchGenerations(userId);
  }

  async function deleteGeneration(id: string) {
    await supabase.from("generations").delete().eq("id", id);
    if (userId) fetchGenerations(userId);
  }

  if (!userId) return null;

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Tools", url: "/tools" },
    { name: "Video Generator", url: "/tools/video" },
  ];

  return (
    <div className="min-h-screen bg-background pt-14">
      <ToolNavbar title="Video Generation" />
      <div className="p-6 md:p-10 max-w-6xl mx-auto">
        <Breadcrumb items={breadcrumbs} className="mb-4" />
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition"><ArrowLeft className="size-5" /></Link>
          <div className="size-10 rounded-xl btn-gradient grid place-items-center"><Video className="size-5 text-white" /></div>
          <div>
            <h1 className="font-display text-3xl font-bold">Free AI Video Generator</h1>
            <p className="text-muted-foreground text-sm">Create cinematic AI videos from text prompts</p>
          </div>
          <Badge variant="outline" className="ml-auto">{CREDITS_PER_VIDEO} credits</Badge>
        </div>

        <Card className="glass border-0 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="text">Text to Video</TabsTrigger>
              <TabsTrigger value="reference">Reference to Video</TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4">
              <div>
                <div className="flex justify-between items-center">
                  <Label>Prompt</Label>
                  <span className="text-xs text-muted-foreground">{prompt.length}/{MAX_PROMPT_LENGTH}</span>
                </div>
                <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe your video scene..." rows={4} className="mt-1 bg-muted/50 border-border resize-none" maxLength={MAX_PROMPT_LENGTH} />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2"><Label>Duration: {duration}s</Label></div>
                <Slider value={[duration]} onValueChange={([v]) => setDuration(v)} min={1} max={10} step={1} className="w-full" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>1s</span><span>10s</span></div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Resolution</Label>
                  <Select value={resolution} onValueChange={setResolution}>
                    <SelectTrigger className="mt-1 bg-muted/50 border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>{RESOLUTIONS.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Aspect Ratio</Label>
                  <Select value={aspectRatio} onValueChange={setAspectRatio}>
                    <SelectTrigger className="mt-1 bg-muted/50 border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>{ASPECT_RATIOS.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
                <div>
                  <Label className="text-sm font-medium">Generate Audio</Label>
                  <p className="text-xs text-muted-foreground mt-1">AI generates matching background audio</p>
                </div>
                <Switch checked={generateAudio} onCheckedChange={setGenerateAudio} />
              </div>
            </TabsContent>

            <TabsContent value="reference" className="space-y-4">
              <div>
                <div className="flex justify-between items-center">
                  <Label>Prompt</Label>
                  <span className="text-xs text-muted-foreground">{prompt.length}/{MAX_PROMPT_LENGTH}</span>
                </div>
                <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe your video. Use [image1], [video1], [audio1] in prompt to reference uploads." rows={4} className="mt-1 bg-muted/50 border-border resize-none" maxLength={MAX_PROMPT_LENGTH} />
              </div>
              <div>
                <Label>Reference Images (up to 9)</Label>
                <div className="p-4 border border-border rounded-lg bg-muted/30">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {referenceImageUrls.map((img, idx) => (
                      <div key={idx} className="relative">
                        <img src={img} alt={`Ref ${idx + 1}`} className="w-16 h-16 object-cover rounded" />
                        <button onClick={() => setReferenceImageUrls((p) => p.filter((_, i) => i !== idx))} className="absolute -top-1 -right-1 size-4 bg-destructive text-white rounded-full flex items-center justify-center"><X className="size-2" /></button>
                      </div>
                    ))}
                  </div>
                  {referenceImageUrls.length < 9 && (
                    <label className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded cursor-pointer transition">
                      <ImageIcon className="size-4" /><span className="text-sm">Add Image</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFileUpload(e, setReferenceImageUrls, 9, referenceImageUrls.length)} />
                    </label>
                  )}
                </div>
              </div>
              <div>
                <Label>Reference Videos (up to 3)</Label>
                <div className="p-4 border border-border rounded-lg bg-muted/30">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {referenceVideoUrls.map((vid, idx) => (
                      <div key={idx} className="relative">
                        <video src={vid} className="w-20 h-14 object-cover rounded bg-black" />
                        <button onClick={() => setReferenceVideoUrls((p) => p.filter((_, i) => i !== idx))} className="absolute -top-1 -right-1 size-4 bg-destructive text-white rounded-full flex items-center justify-center"><X className="size-2" /></button>
                      </div>
                    ))}
                  </div>
                  {referenceVideoUrls.length < 3 && (
                    <label className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded cursor-pointer transition">
                      <Video className="size-4" /><span className="text-sm">Add Video</span>
                      <input type="file" accept="video/*" multiple className="hidden" onChange={(e) => handleFileUpload(e, setReferenceVideoUrls, 3, referenceVideoUrls.length)} />
                    </label>
                  )}
                </div>
              </div>
              <div>
                <Label>Reference Audios (up to 3)</Label>
                <div className="p-4 border border-border rounded-lg bg-muted/30">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {referenceAudioUrls.map((aud, idx) => (
                      <div key={idx} className="relative flex items-center gap-2 px-2 py-1 bg-muted rounded">
                        <Music className="size-4" /><span className="text-xs">audio{idx + 1}</span>
                        <button onClick={() => setReferenceAudioUrls((p) => p.filter((_, i) => i !== idx))} className="size-4 bg-destructive text-white rounded-full flex items-center justify-center"><X className="size-2" /></button>
                      </div>
                    ))}
                  </div>
                  {referenceAudioUrls.length < 3 && (
                    <label className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded cursor-pointer transition">
                      <Music className="size-4" /><span className="text-sm">Add Audio</span>
                      <input type="file" accept="audio/*" multiple className="hidden" onChange={(e) => handleFileUpload(e, setReferenceAudioUrls, 3, referenceAudioUrls.length)} />
                    </label>
                  )}
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2"><Label>Duration: {duration}s</Label></div>
                <Slider value={[duration]} onValueChange={([v]) => setDuration(v)} min={1} max={10} step={1} className="w-full" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Resolution</Label>
                  <Select value={resolution} onValueChange={setResolution}>
                    <SelectTrigger className="mt-1 bg-muted/50 border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>{RESOLUTIONS.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Aspect Ratio</Label>
                  <Select value={aspectRatio} onValueChange={setAspectRatio}>
                    <SelectTrigger className="mt-1 bg-muted/50 border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>{ASPECT_RATIOS.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
                <div>
                  <Label className="text-sm font-medium">Generate Audio</Label>
                  <p className="text-xs text-muted-foreground mt-1">AI generates matching background audio</p>
                </div>
                <Switch checked={generateAudio} onCheckedChange={setGenerateAudio} />
              </div>
            </TabsContent>
          </Tabs>

          <Button onClick={handleGenerate} disabled={!prompt.trim()} className="mt-6 btn-gradient text-white border-0">
            <Sparkles className="size-4 mr-2" /> Generate Video ({CREDITS_PER_VIDEO} credits)
          </Button>
        </Card>

        {/* Generation queue */}
        {queue.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg font-semibold">Generation Queue</h2>
              <span className="text-xs text-muted-foreground">
                {queue.filter((i) => i.status === "generating" || i.status === "queued").length} active
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {queue.map((item) => (
                <QueueItemCard key={item.id} item={item} onDismiss={dismissQueueItem} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-10">
          <Card className="glass border-0 p-6">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="size-5 text-primary" />
              <h2 className="font-display text-xl font-semibold">Frequently Asked Questions</h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="q1">
                <AccordionTrigger>How does the AI video generator work?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Describe your video scene with a text prompt, set duration (1-10 seconds), resolution (720p HD or 1080p Full HD), and aspect ratio (16:9, 9:16 for shorts, or 1:1 square). The AI creates a cinematic video in 2-3 minutes.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q2">
                <AccordionTrigger>Is the AI video generator free?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes, you start with 50 free credits. Each video costs 30 credits, giving you at least 1 free video to create. No credit card required.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q3">
                <AccordionTrigger>Can I add audio to my AI videos?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes, AI-generated background audio automatically matches your video's mood. Toggle "Generate Audio" before generating, or upload custom audio tracks in reference mode.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q4">
                <AccordionTrigger>What video resolutions are supported?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  720p HD and 1080p Full HD. Aspect ratios: 16:9 (landscape), 9:16 (portrait for TikTok/Reels), and 1:1 (square for Instagram).
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q5">
                <AccordionTrigger>Can I use reference images or videos?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes, upload up to 9 reference images, 3 reference videos, and 3 audio tracks. Use [image1], [video1], or [audio1] in your prompt to reference specific uploads.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        </div>

        {/* Your Videos grid */}
        <div className="mt-10">
          <h2 className="font-display text-xl font-semibold">Your Videos</h2>
          {generations.length === 0 ? (
            <Card className="glass border-0 p-12 text-center mt-4">
              <Video className="size-12 mx-auto text-muted-foreground opacity-50" />
              <p className="mt-4 text-muted-foreground">No videos yet. Create your first one above!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {generations.map((gen) => (
                <Card key={gen.id} className="glass border-0 overflow-hidden">
                  <div className="relative bg-black aspect-video">
                    {gen.result_url ? (
                      <video src={gen.result_url} className="w-full h-full object-cover" muted playsInline
                        onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play()}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLVideoElement).pause(); (e.currentTarget as HTMLVideoElement).currentTime = 0; }}
                      />
                    ) : gen.status === "processing" ? (
                      <div className="flex flex-col items-center justify-center h-full gap-2">
                        <Loader2 className="size-6 animate-spin text-primary" />
                        <span className="text-xs text-white/70">Processing...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <Video className="size-8 text-white/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs line-clamp-1">{gen.prompt}</p>
                    <div className="mt-1.5 flex items-center gap-1">
                      <span className="text-[10px] text-muted-foreground">{new Date(gen.created_at).toLocaleDateString()}</span>
                      <div className="ml-auto flex gap-1">
                        <Button variant="ghost" size="sm" className="size-6 p-0" onClick={() => toggleFavorite(gen.id, gen.is_favorite)}>
                          <Heart className={`size-3 ${gen.is_favorite ? "fill-red-500 text-red-500" : ""}`} />
                        </Button>
                        {gen.result_url && (
                          <Button variant="ghost" size="sm" className="size-6 p-0" asChild>
                            <a href={gen.result_url} download target="_blank" rel="noopener noreferrer"><Download className="size-3" /></a>
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="size-6 p-0" onClick={() => deleteGeneration(gen.id)}>
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
