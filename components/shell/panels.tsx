import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-5 pb-1">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="text-muted-foreground mt-0.5 text-[13px]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

export function DetailHero({
  backHref,
  backLabel,
  avatar,
  title,
  titleBadge,
  subtitle,
  meta,
  chips,
  actions,
}: {
  backHref: string;
  backLabel: string;
  avatar?: React.ReactNode;
  title: string;
  titleBadge?: React.ReactNode;
  subtitle?: string;
  meta?: React.ReactNode;
  chips?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="pt-5">
      <Link
        href={backHref}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-[13px] transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        {backLabel}
      </Link>
      <div className="bg-card mt-3 rounded-lg border">
        <div className="flex flex-wrap items-start justify-between gap-4 p-5">
          <div className="flex min-w-0 items-start gap-4">
            {avatar}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
                  {title}
                </h1>
                {titleBadge}
              </div>
              {subtitle ? (
                <p className="text-muted-foreground mt-1 max-w-xl text-[13px] sm:text-sm">
                  {subtitle}
                </p>
              ) : null}
              {meta ? (
                <div className="text-muted-foreground/80 mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px]">
                  {meta}
                </div>
              ) : null}
              {chips ? (
                <div className="mt-3 flex flex-wrap gap-1.5">{chips}</div>
              ) : null}
            </div>
          </div>
          {actions ? (
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function Panel({
  title,
  count,
  action,
  flush = false,
  className,
  children,
}: {
  title: string;
  count?: number | string;
  action?: React.ReactNode;
  flush?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn("bg-card overflow-hidden rounded-lg border", className)}
    >
      <div className="flex items-center justify-between gap-3 border-b px-4 py-2.5">
        <div className="flex items-baseline gap-2">
          <h2 className="text-[13px] font-semibold">{title}</h2>
          {count !== undefined ? (
            <span className="text-muted-foreground/80 font-mono text-[11px] tabular-nums">
              {count}
            </span>
          ) : null}
        </div>
        {action}
      </div>
      <div className={flush ? undefined : "p-4"}>{children}</div>
    </section>
  );
}

export function PanelRow({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "hover:bg-muted/40 flex items-center gap-3 px-4 py-2.5 text-[13px] transition-colors",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Section({
  title,
  count,
  action,
  className,
  children,
}: {
  title: string;
  count?: number | string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={className}>
      <div className="flex items-center justify-between gap-3 pb-2">
        <div className="flex items-baseline gap-2">
          <h2 className="text-[13px] font-semibold">{title}</h2>
          {count !== undefined ? (
            <span className="text-muted-foreground/80 font-mono text-[11px] tabular-nums">
              {count}
            </span>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-1.75 text-[13px]">
      <span className="text-muted-foreground w-28 shrink-0">{label}</span>
      <span className="min-w-0 flex-1">{children}</span>
    </div>
  );
}
