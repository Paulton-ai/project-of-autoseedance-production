interface AdSlotProps {
  format: "leaderboard" | "in-article" | "rectangle" | "inline";
  className?: string;
}

/**
 * AdSense placeholder slots.
 * Replace the inner markup with your actual <ins class="adsbygoogle" /> tag
 * and the corresponding push script when your AdSense account is approved.
 */
export function AdSlot({ format, className = "" }: AdSlotProps) {
  const sizes: Record<AdSlotProps["format"], string> = {
    leaderboard: "h-[90px] md:h-[120px]",
    "in-article": "h-[250px]",
    rectangle: "h-[280px]",
    inline: "h-[120px]",
  };
  return (
    // ADSENSE SLOT: replace with your ad code
    <div
      className={`my-6 flex items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 text-xs uppercase tracking-widest text-muted-foreground ${sizes[format]} ${className}`}
      aria-label="Advertisement"
    >
      Ad · {format}
    </div>
  );
}
