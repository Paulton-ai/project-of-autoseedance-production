import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { History, Image as ImageIcon, Video, Film, Download, Heart, Trash2, Sparkles, Clock } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/dashboard/history")({
  component: HistoryPage,
  head: () => ({ meta: [{ title: "History — Auto Seedance AI" }, { name: "robots", content: "noindex, nofollow" }] }),
});

type Generation = Tables<"generations">;
type HistoryItem = {
  id: string;
  tool_type: "image" | "video" | "reel";
  prompt: string;
  result_url: string | null;
  status: string;
  credits_used: number;
  created_at: string;
  is_favorite: boolean;
};

function HistoryPage() {
  const { user } = useSession();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [filter, setFilter] = useState<"all" | "image" | "video" | "reel">("all");
  const [loading, setLoading] = useState(true);

  async function fetchGenerations() {
    if (!user) return;
    setLoading(true);
    const standardPromise = filter === "reel"
      ? Promise.resolve({ data: [], error: null })
      : supabase.from("generations").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100);
    const reelPromise = filter === "image" || filter === "video"
      ? Promise.resolve({ data: [], error: null })
      : supabase.from("reel_generations").select("id, topic, final_video_url, status, credits_used, created_at, updated_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100);
    const [standardRes, reelRes] = await Promise.all([standardPromise, reelPromise]);

    const standardItems: HistoryItem[] = !standardRes.error
      ? ((standardRes.data as Generation[]) ?? []).filter((g) => g.tool_type === "image" || g.tool_type === "video").map((g) => ({ id: g.id, tool_type: g.tool_type as "image" | "video", prompt: g.prompt, result_url: g.result_url, status: g.status, credits_used: g.credits_used, created_at: g.created_at, is_favorite: g.is_favorite }))
      : [];
    const reelItems: HistoryItem[] = !reelRes.error
      ? ((reelRes.data as any[]) ?? []).map((r) => ({ id: r.id, tool_type: "reel" as const, prompt: r.topic || "AI Reel", result_url: r.final_video_url ?? null, status: r.status, credits_used: r.credits_used ?? 40, created_at: r.created_at || r.updated_at, is_favorite: false }))
      : [];
    setItems([...standardItems, ...reelItems].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    setLoading(false);
  }

  useEffect(() => { fetchGenerations(); }, [user, filter]);

  async function toggleFavorite(id: string, current: boolean) {
    await supabase.from("generations").update({ is_favorite: !current }).eq("id", id);
    fetchGenerations();
  }

  async function deleteGeneration(item: HistoryItem) {
    if (item.tool_type === "reel") {
      await supabase.from("reel_generations").delete().eq("id", item.id);
    } else {
      await supabase.from("generations").delete().eq("id", item.id);
    }
    toast.success("Deleted");
    fetchGenerations();
  }

  const imageCount = items.filter((g) => g.tool_type === "image").length;
  const videoCount = items.filter((g) => g.tool_type === "video").length;
  const reelCount = items.filter((g) => g.tool_type === "reel").length;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <h1 className="font-display text-3xl font-bold">Generation History</h1>
      <p className="text-muted-foreground mt-1">All your AI-generated content in one place</p>
      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="mt-6">
        <TabsList className="bg-muted/50 flex-wrap h-auto">
          <TabsTrigger value="all"><History className="size-4 mr-2" /> All ({items.length})</TabsTrigger>
          <TabsTrigger value="image"><ImageIcon className="size-4 mr-2" /> Images ({imageCount})</TabsTrigger>
          <TabsTrigger value="video"><Video className="size-4 mr-2" /> Videos ({videoCount})</TabsTrigger>
          <TabsTrigger value="reel"><Film className="size-4 mr-2" /> Reels ({reelCount})</TabsTrigger>
        </TabsList>
        <TabsContent value={filter} className="mt-6">
          {loading ? (
            <div className="grid place-items-center py-12"><Sparkles className="size-8 animate-pulse text-primary" /></div>
          ) : items.length === 0 ? (
            <Card className="glass border-0 p-12 text-center"><History className="size-12 mx-auto text-muted-foreground opacity-50" /><p className="mt-4 text-muted-foreground">No generations yet.</p><p className="text-sm text-muted-foreground mt-1">Create content in the Image, Video, or Reel Generator tools.</p></Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((gen) => (
                <Card key={`${gen.tool_type}-${gen.id}`} className="glass border-0 overflow-hidden">
                  <div className={`relative ${gen.tool_type === "image" ? "aspect-square" : "aspect-video"} bg-muted grid place-items-center`}>
                    {gen.result_url ? (
                      gen.tool_type === "video" || gen.tool_type === "reel" ? <video src={gen.result_url} controls className="size-full object-contain" /> : <img src={gen.result_url} alt={gen.prompt} className="size-full object-cover" loading="lazy" />
                    ) : gen.status === "processing" || gen.status === "script_ready" ? (
                      <div className="flex flex-col items-center gap-2"><Clock className="size-8 animate-pulse text-primary" /><span className="text-xs text-muted-foreground">Processing...</span></div>
                    ) : gen.status === "failed" ? (
                      <div className="flex flex-col items-center gap-2 text-destructive"><span className="text-xs">Failed</span></div>
                    ) : <Sparkles className="size-12 text-muted-foreground opacity-50" />}
                    <Badge variant="outline" className="absolute top-2 left-2 border-border bg-background/80 backdrop-blur"><>{gen.tool_type === "image" ? <ImageIcon className="size-3 mr-1" /> : gen.tool_type === "video" ? <Video className="size-3 mr-1" /> : <Film className="size-3 mr-1" />}</>{gen.tool_type}</Badge>
                    {gen.is_favorite && gen.result_url && <div className="absolute top-2 right-2"><Heart className="size-5 fill-red-500 text-red-500" /></div>}
                  </div>
                  <div className="p-4">
                    <p className="text-sm line-clamp-2">{gen.prompt}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"><span>{gen.credits_used} credits</span><span>·</span><span>{new Date(gen.created_at).toLocaleDateString()}</span></div>
                    <div className="mt-3 flex gap-2">
                      {gen.tool_type !== "reel" && <Button variant="ghost" size="sm" className="flex-1" onClick={() => toggleFavorite(gen.id, gen.is_favorite)}><Heart className={`size-4 ${gen.is_favorite ? "fill-red-500 text-red-500" : ""}`} /></Button>}
                      {gen.result_url && <Button variant="ghost" size="sm" className="flex-1" asChild><a href={gen.result_url} download target="_blank" rel="noopener noreferrer"><Download className="size-4" /></a></Button>}
                      <Button variant="ghost" size="sm" className="flex-1" onClick={() => deleteGeneration(gen)}><Trash2 className="size-4" /></Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}