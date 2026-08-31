import { QUERIES } from "@/constants";

export function Marquee() {
  return (
    <div className="relative z-10 border-t border-foreground/10 py-4">
      <div className="flex overflow-hidden mask-[linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="animate-marquee flex shrink-0 items-center gap-8 pr-8">
          {[...QUERIES, ...QUERIES].map((query, i) => (
            <span
              key={i}
              className="flex items-center gap-8 font-mono text-xs whitespace-nowrap text-foreground/45"
            >
              &ldquo;{query}&rdquo;
              <span className="size-1 rounded-full bg-foreground/30" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
