"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import { type Stage } from "@/sanity/schemas/stages";
import { StageMixBar } from "@/components/stage-mix-bar";
import { InitialsChip } from "@/components/initials-chip";
import { askVetra } from "@/components/today/ask-vetra";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type LedgerSearch = {
  id: string;
  title: string;
  ageDays: number;
  salaryRange: string | null;
  inPlay: number;
  mix: Partial<Record<Stage, number>>;
  blurb: string;
};

export type LedgerActivity = {
  date: string;
  name: string;
  text: string;
  candidateId: string | null;
};

export type LedgerRow = {
  id: string;
  name: string;
  industry: string | null;
  rolesOpen: number;
  inPlay: number;
  mix: Partial<Record<Stage, number>>;
  lastSpokeDays: number | null;
  promise: { label: string; tone: "danger" | "warn" | "good" | "muted" };
  searches: LedgerSearch[];
  activity: LedgerActivity[];
  engagement: { label: string; value: string; mono?: boolean }[];
};

const TONE_TEXT: Record<LedgerRow["promise"]["tone"], string> = {
  danger: "text-rose-700 font-medium",
  warn: "text-stage-offer font-medium",
  good: "text-stage-hired font-medium",
  muted: "text-muted-foreground",
};

function lastSpokeLabel(days: number | null): string {
  if (days === null) return "—";
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days >= 60) return `${Math.floor(days / 30)} mo ago`;
  return `${days} days ago`;
}

export function LedgerRows({
  rows,
  aiAllowed,
}: {
  rows: LedgerRow[];
  aiAllowed: boolean;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="border-t">
      <div className="text-muted-foreground/80 flex h-9 items-center gap-3 border-b px-1 font-mono text-[10px] tracking-[0.13em] uppercase">
        <span className="w-52.5">Client</span>
        <span className="w-14 text-right">Roles</span>
        <span className="w-14 text-right">In play</span>
        <span className="hidden flex-1 md:block">Where they are</span>
        <span className="hidden w-24 lg:block">Last spoke</span>
        <span className="w-30">Promise</span>
      </div>
      {rows.map((row) => {
        const open = openId === row.id;
        const dormant = row.rolesOpen === 0 && row.inPlay === 0;
        return (
          <div key={row.id}>
            <div
              onClick={() => setOpenId(open ? null : row.id)}
              className={cn(
                "hover:bg-muted/40 flex h-13 cursor-pointer items-center gap-3 border-b px-1 transition-colors",
                open && "bg-muted/50",
                dormant && "opacity-70",
              )}
            >
              <div className="flex w-52.5 min-w-0 items-center gap-2.5">
                <ChevronRight
                  className={cn(
                    "text-muted-foreground size-3.5 shrink-0 transition-transform",
                    open && "rotate-90",
                  )}
                />
                <InitialsChip name={row.name} size="sm" />
                <div className="min-w-0">
                  <Link
                    href={`/dashboard/companies/${row.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="block truncate text-[13.5px] font-semibold hover:underline"
                  >
                    {row.name}
                  </Link>
                  <p className="text-muted-foreground truncate text-[11.5px]">
                    {row.industry ?? "—"}
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  "font-display w-14 text-right text-base font-semibold tabular-nums",
                  dormant && "text-muted-foreground",
                )}
              >
                {row.rolesOpen}
              </span>
              <span
                className={cn(
                  "font-display w-14 text-right text-base font-semibold tabular-nums",
                  dormant && "text-muted-foreground",
                )}
              >
                {row.inPlay}
              </span>
              <div className="hidden min-w-0 flex-1 md:block">
                <StageMixBar counts={row.mix} className="h-2 gap-px" />
              </div>
              <span
                className={cn(
                  "hidden w-24 font-mono text-xs tabular-nums lg:block",
                  row.lastSpokeDays !== null && row.lastSpokeDays > 10
                    ? "text-rose-700"
                    : row.lastSpokeDays !== null && row.lastSpokeDays > 6
                      ? "text-stage-offer"
                      : "text-muted-foreground",
                )}
              >
                {lastSpokeLabel(row.lastSpokeDays)}
              </span>
              <span
                className={cn(
                  "w-30 truncate text-xs",
                  TONE_TEXT[row.promise.tone],
                )}
              >
                {row.promise.label}
              </span>
            </div>
            {open ? (
              <div className="bg-card border-b px-1 py-4 md:px-6">
                <div className="flex flex-col gap-7 lg:flex-row">
                  <div className="min-w-0 flex-1">
                    <p className="text-muted-foreground/80 font-mono text-[10px] tracking-[0.13em] uppercase">
                      Open searches
                    </p>
                    {row.searches.length === 0 ? (
                      <p className="text-muted-foreground mt-2.5 text-[12.5px]">
                        No open roles — the engagement is dormant.
                      </p>
                    ) : (
                      <div className="mt-2.5 divide-y overflow-hidden rounded-lg border">
                        {row.searches.map((search) => (
                          <div
                            key={search.id}
                            className="bg-card flex min-h-13 flex-wrap items-center gap-x-3 gap-y-1.5 px-3.5 py-2"
                          >
                            <div className="w-47.5 min-w-0">
                              <p className="truncate text-[13px] font-medium">
                                {search.title}
                              </p>
                              <p className="text-muted-foreground truncate text-[11.5px]">
                                Opened {search.ageDays}d ago
                                {search.salaryRange
                                  ? ` · ${search.salaryRange}`
                                  : ""}
                              </p>
                            </div>
                            <div className="hidden w-32 sm:block">
                              <StageMixBar
                                counts={search.mix}
                                className="h-1.75 gap-px"
                              />
                            </div>
                            <span className="font-display w-16 text-[15px] font-semibold tabular-nums">
                              {search.inPlay}
                              <span className="text-muted-foreground font-sans text-[11.5px] font-normal">
                                {" "}
                                in play
                              </span>
                            </span>
                            <p className="text-muted-foreground min-w-0 flex-1 truncate text-xs">
                              {search.blurb}
                            </p>
                            <Button
                              size="sm"
                              className="h-6.5 px-2.5 text-xs"
                              nativeButton={false}
                              render={
                                <Link href={`/dashboard/jobs/${search.id}`} />
                              }
                            >
                              Open
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    {row.activity.length > 0 ? (
                      <>
                        <p className="text-muted-foreground/80 mt-5 font-mono text-[10px] tracking-[0.13em] uppercase">
                          Since you last spoke
                        </p>
                        <div className="mt-2 flex flex-col gap-1.5">
                          {row.activity.map((item, i) => (
                            <div
                              key={i}
                              className="flex items-baseline gap-2.5"
                            >
                              <span className="text-muted-foreground w-16 shrink-0 font-mono text-[11.5px] tabular-nums">
                                {item.date}
                              </span>
                              <p className="text-muted-foreground min-w-0 truncate text-[12.5px]">
                                {item.candidateId ? (
                                  <Link
                                    href={`/dashboard/candidates/${item.candidateId}`}
                                    className="text-foreground font-medium hover:underline"
                                  >
                                    {item.name}
                                  </Link>
                                ) : (
                                  <span className="text-foreground font-medium">
                                    {item.name}
                                  </span>
                                )}{" "}
                                {item.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : null}
                  </div>
                  <div className="w-full shrink-0 lg:w-74">
                    <p className="text-muted-foreground/80 font-mono text-[10px] tracking-[0.13em] uppercase">
                      The engagement
                    </p>
                    <div className="mt-2 flex flex-col">
                      {row.engagement.map((fact) => (
                        <div
                          key={fact.label}
                          className="flex items-baseline justify-between border-b py-1.5 last:border-0"
                        >
                          <span className="text-muted-foreground text-[12.5px]">
                            {fact.label}
                          </span>
                          <span
                            className={cn(
                              "text-[12.5px] font-medium",
                              fact.mono && "font-mono font-normal tabular-nums",
                            )}
                          >
                            {fact.value}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="border-ai/25 bg-ai-soft/30 mt-4 rounded-lg border p-3">
                      <p className="text-ai flex items-center gap-1.5 text-xs font-semibold">
                        <Sparkles className="size-3" />
                        Draft the {row.name} update
                      </p>
                      <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
                        {row.lastSpokeDays !== null && row.lastSpokeDays > 0
                          ? `${row.lastSpokeDays} days of movement, written from the records — you edit before it sends.`
                          : "Written from the records — you edit before it sends."}
                      </p>
                      {aiAllowed ? (
                        <Button
                          size="sm"
                          className="bg-ai text-ai-foreground hover:bg-ai/90 mt-2.5 h-6.5 px-2.5 text-xs"
                          onClick={() =>
                            askVetra(
                              `Draft a client update for ${row.name} covering the last ${Math.max(row.lastSpokeDays ?? 7, 7)} days — stage moves, interviews and debriefs, written as an email I can edit.`,
                            )
                          }
                        >
                          Write it
                        </Button>
                      ) : (
                        <p className="text-muted-foreground mt-2 text-xs">
                          On Pro —{" "}
                          <Link
                            href="/dashboard/billing"
                            className="text-ai underline underline-offset-2"
                          >
                            see plans
                          </Link>
                          .
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
