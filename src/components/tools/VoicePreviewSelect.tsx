import { useRef, useState } from "react";
import { Play, Pause, Loader2 } from "lucide-react";
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { VOICE_GROUPS, voiceValue, voicePreviewPath, VOICE_PREVIEW_BUCKET } from "@/lib/reel-voices";

// Cache signed URLs per voice for the session so a replay costs nothing.
const urlCache = new Map<string, string>();

async function previewUrl(value: string): Promise<string | null> {
  const cached = urlCache.get(value);
  if (cached) return cached;
  const path = voicePreviewPath(value);
  if (!path) return null;
  const { data, error } = await supabase.storage
    .from(VOICE_PREVIEW_BUCKET)
    .createSignedUrl(path, 60 * 60);
  if (error || !data?.signedUrl) return null;
  urlCache.set(value, data.signedUrl);
  return data.signedUrl;
}

export function VoicePreviewSelect({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (v: string) => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);

  const stop = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    setPlaying(null);
  };

  const play = async (val: string) => {
    if (playing === val) return stop();
    stop();
    setLoading(val);
    const url = await previewUrl(val);
    setLoading(null);
    if (!url) return;
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onended = () => setPlaying(null);
    audio.onerror = () => setPlaying(null);
    setPlaying(val);
    void audio.play().catch(() => setPlaying(null));
  };

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="mt-2"><SelectValue placeholder="Select a voice" /></SelectTrigger>
      <SelectContent className="max-h-72">
        {VOICE_GROUPS.map((g) => (
          <SelectGroup key={g.code}>
            <SelectLabel>{g.language}</SelectLabel>
            {g.names.map((n) => {
              const val = voiceValue(n, g.code);
              const isLoading = loading === val;
              const isPlaying = playing === val;
              return (
                <div key={val} className="relative">
                  <SelectItem value={val} className="pr-10">{n}</SelectItem>
                  <button
                    type="button"
                    aria-label={`Preview ${n} voice`}
                    title={`Preview ${n}`}
                    onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); void play(val); }}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    {isLoading
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : isPlaying
                        ? <Pause className="h-3.5 w-3.5" />
                        : <Play className="h-3.5 w-3.5" />}
                  </button>
                </div>
              );
            })}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}

export default VoicePreviewSelect;
