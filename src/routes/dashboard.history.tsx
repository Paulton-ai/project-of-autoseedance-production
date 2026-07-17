import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { History, Image as ImageIcon, Video, Download, Heart, Trash2, Sparkles, Clock } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/dashboard/history")({
  component: HistoryPage,
  head: () => ({
    meta: [
      { title: "History — Auto Seedance AI" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

type Generation = Tables<"generations">;

function HistoryPage() {
  const { user } = useSession();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");
  const [loading, setLoading] = useState(true);

  async function fetchGenerations() {
    if (!user) return;

    let query = supabase
      .from("generations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("tool_type", filter);
    }

    const { data, error } = await query.limit(100);

    if (!error) setGenerations((data as Generation[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchGenerations();
  }, [user, filter]);

  async function toggleFavorite(id: string, current: boolean) {
    await supabase.from("generations").update({ is_favorite: !current }).eq("id", id);
    fetchGenerations();
  }

  async function deleteGeneration(id: string) {
    await supabase.from("generations").delete().eq("id", id);
    toast.success("Deleted");
    fetchGenerations();
  }

  const imageCount = generations.filter((g) => g.tool_type === "image").length;
  const videoCount = generations.filter((g) => g.tool_type === "video").length;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <h1 className="font-display text-3xl font-bold">Generation History</h1>
      <p className="text-muted-foreground mt-1">All your AI-generated content in one place</p>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="mt-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="all" className="data-[state=active]:bg-background">
            <History className="size-4 mr-2" /> All ({generations.length})
          </TabsTrigger>
          <TabsTrigger value="image" className="data-[state=active]:bg-background">
            <ImageIcon className="size-4 mr-2" /> Images ({imageCount})
          </TabsTrigger>
          <TabsTrigger value="video" className="data-[state=active]:bg-background">
            <Video className="size-4 mr-2" /> Videos ({videoCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          {loading ? (
            <div className="grid place-items-center py-12">
              <Sparkles className="size-8 animate-pulse text-primary" />
            </div>
          ) : generations.length === 0 ? (
            <Card className="glass border-0 p-12 text-center">
              <History className="size-12 mx-auto text-muted-foreground opacity-50" />
              <p className="mt-4 text-muted-foreground">No generations yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                {filter === "all" ? "Create content in the Image or Video tools." : `No ${filter} generations yet.`}
              </p>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {generations.map((gen) => (
                <Card key={gen.id} className="glass border-0 overflow-hidden">
                  <div
                    className={`relative ${
                      gen.tool_type === "video"
                        ? "aspect-video"
                        : "aspect-square"
                    } bg-muted grid place-items-center`}
                  >
                    {gen.result_url ? (
                      gen.tool_type === "video" && (gen.result_url.endsWith(".mp4") || gen.result_url.includes("video")) ? (
                        <video
                          src={gen.result_url}
                          controls
                          className="size-full object-contain"
                        />
                      ) : (
                        <img
                          src={gen.result_url}
                          alt={gen.prompt}
                          className="size-full object-cover"
                          loading="lazy"
                        />
                      )
                    ) : gen.status === "processing" ? (
                      <div className="flex flex-col items-center gap-2">
                        <Clock className="size-8 animate-pulse text-primary" />
                        <span className="text-xs text-muted-foreground">Processing...</span>
                      </div>
                    ) : gen.status === "failed" ? (
                      <div className="flex flex-col items-center gap-2 text-destructive">
                        <span className="text-xs">Failed</span>
                      </div>
                    ) : (
                      <Sparkles className="size-12 text-muted-foreground opacity-50" />
                    )}
                    {gen.is_favorite && gen.result_url && (
                      <div className="absolute top-2 right-2">
                        <Heart className="size-5 fill-red-500 text-red-500" />
                      </div>
                    )}
                    <Badge
                      variant="outline"
                      className="absolute top-2 left-2 border-border bg-background/80 backdrop-blur"
                    >
                      {gen.tool_type === "video" ? <Video className="size-3 mr-1" /> : <ImageIcon className="size-3 mr-1" />}
                      {gen.tool_type}
                    </Badge>
                  </div>

                  <div className="p-4">
                    <p className="text-sm line-clamp-2">{gen.prompt}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{gen.credits_used} credits</span>
                      <span>·</span>
                      <span>{new Date(gen.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        onClick={() => toggleFavorite(gen.id, gen.is_favorite)}
                      >
                        <Heart className={`size-4 ${gen.is_favorite ? "fill-red-500 text-red-500" : ""}`} />
                      </Button>
                      {gen.result_url && (
                        <Button variant="ghost" size="sm" className="flex-1" asChild>
                          <a href={gen.result_url} download target="_blank" rel="noopener noreferrer">
                            <Download className="size-4" />
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        onClick={() => deleteGeneration(gen.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
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
