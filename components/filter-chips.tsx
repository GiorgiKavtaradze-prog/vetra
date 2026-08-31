"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function useParamNavigate() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (param: string, value: string | null) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") next.delete(param);
    else next.set(param, value);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };
}

export function FilterChips({
  param,
  options,
  allLabel = "All",
}: {
  param: string;
  options: { value: string; label: string }[];
  allLabel?: string;
}) {
  const searchParams = useSearchParams();
  const navigate = useParamNavigate();
  const current = searchParams.get(param);

  const chips = [{ value: "", label: allLabel }, ...options];

  return (
    <div className="flex flex-wrap items-center gap-1">
      {chips.map((chip) => {
        const active = (current ?? "") === chip.value;
        return (
          <button
            key={chip.value || "__all"}
            type="button"
            onClick={() => navigate(param, chip.value || null)}
            aria-pressed={active}
            className={cn(
              "cursor-pointer rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
              active
                ? "bg-foreground/8 text-foreground"
                : "text-muted-foreground hover:bg-foreground/4 hover:text-foreground",
            )}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}

export function FilterSelect({
  param,
  options,
  placeholder,
  className,
}: {
  param: string;
  options: { value: string; label: string }[];
  placeholder: string;
  className?: string;
}) {
  const searchParams = useSearchParams();
  const navigate = useParamNavigate();
  const current = searchParams.get(param);

  return (
    <Select
      value={current ?? "__all"}
      onValueChange={(value) =>
        navigate(param, value === "__all" ? null : value)
      }
      items={[{ value: "__all", label: placeholder }, ...options]}
    >
      <SelectTrigger
        size="sm"
        className={cn("w-auto min-w-32 text-[13px]", className)}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__all">{placeholder}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
