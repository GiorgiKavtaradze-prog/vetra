import { cn } from "@/lib/utils";

const HUES = [
  "bg-slate-200 text-slate-700",
  "bg-blue-100 text-blue-800",
  "bg-violet-100 text-violet-800",
  "bg-amber-100 text-amber-800",
  "bg-emerald-100 text-emerald-800",
  "bg-rose-100 text-rose-800",
] as const;

export function hueIndexFor(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % HUES.length;
}

function hueFor(name: string): (typeof HUES)[number] {
  return HUES[hueIndexFor(name)];
}

export function InitialsChip({
  name,
  src,
  size = "md",
  className,
}: {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        aria-hidden
        loading="lazy"
        className={cn(
          "shrink-0 rounded-full object-cover",
          size === "sm" && "size-6",
          size === "md" && "size-8",
          size === "lg" && "size-11",
          className,
        )}
      />
    );
  }
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold",
        size === "sm" && "size-6 text-[10px]",
        size === "md" && "size-8 text-xs",
        size === "lg" && "size-11 text-sm",
        hueFor(name),
        className,
      )}
    >
      {initials}
    </span>
  );
}
