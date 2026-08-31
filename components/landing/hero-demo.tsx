"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Candidate = { name: string; note: string; pct: number };
type Scene = { question: string; candidates: Candidate[] };

const SCENES: Scene[] = [
  {
    question: "Find me a React engineer with fintech experience",
    candidates: [
      { name: "Priya Raghavan", note: "6 years React · trading UIs", pct: 94 },
      {
        name: "Nadia Hussain",
        note: "Senior React · challenger bank",
        pct: 88,
      },
      { name: "Marcus Bell", note: "Contract React · payments", pct: 81 },
    ],
  },
  {
    question: "Who interviewed well for roles like this before?",
    candidates: [
      {
        name: "Oluwaseun Adeyemi",
        note: "“Made our hardest problem look routine”",
        pct: 96,
      },
      {
        name: "Amara Diallo",
        note: "“Best system-design round this year”",
        pct: 90,
      },
      { name: "Noah Sterling", note: "Strong final, chose to wait", pct: 84 },
    ],
  },
  {
    question: "Who could start within a month?",
    candidates: [
      { name: "Henrik Dahl", note: "2-week notice · ready now", pct: 93 },
      { name: "Carys Llewellyn", note: "Contract ending — available", pct: 87 },
      { name: "Ade Fashola", note: "Immediate · visa in place", pct: 80 },
    ],
  },
];

const TYPE_MS = 38;
const ERASE_MS = 16;
const HOLD_MS = 2800;
const CARD_EXIT_MS = 500;
const CARD_STAGGER_MS = 180;

export function HeroDemo() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [reduced, setReduced] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setReduced(true);
      setTyped(SCENES[0].question);
      setShowResults(true);
      return;
    }

    let cancelled = false;
    const schedule = (fn: () => void, ms: number) => {
      const t = setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
      timers.current.push(t);
    };

    function playScene(index: number) {
      const question = SCENES[index].question;
      setSceneIndex(index);
      setShowResults(false);
      for (let i = 1; i <= question.length; i++) {
        schedule(() => setTyped(question.slice(0, i)), 350 + i * TYPE_MS);
      }
      const typedDone = 350 + question.length * TYPE_MS;
      schedule(() => setShowResults(true), typedDone + 250);
      const holdEnd = typedDone + 250 + HOLD_MS;
      schedule(() => setShowResults(false), holdEnd);
      const eraseStart = holdEnd + CARD_EXIT_MS + 150;
      for (let i = question.length - 1; i >= 0; i--) {
        schedule(
          () => setTyped(question.slice(0, i)),
          eraseStart + (question.length - i) * ERASE_MS,
        );
      }
      schedule(
        () => playScene((index + 1) % SCENES.length),
        eraseStart + question.length * ERASE_MS + 250,
      );
    }

    playScene(0);
    const current = timers.current;
    return () => {
      cancelled = true;
      current.forEach(clearTimeout);
    };
  }, []);

  const scene = SCENES[sceneIndex];

  return (
    <div className="relative w-full max-w-2xl">
      {/* glow bed */}
      <div
        aria-hidden
        className="absolute -inset-10 rounded-[2.5rem] bg-[radial-gradient(60%_60%_at_50%_40%,rgba(0,0,0,0.12),transparent_70%)] blur-2xl dark:bg-[radial-gradient(60%_60%_at_50%_40%,rgba(255,255,255,0.08),transparent_70%)]"
      />
      <div className="relative overflow-hidden rounded-2xl bg-background shadow-2xl shadow-black/15 ring-1 ring-foreground/6">
        <div className="flex items-center gap-3 border-b border-foreground/10 px-5 py-4">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground">
            <Sparkles className="size-4 text-background" />
          </span>
          <p className="min-h-6 flex-1 text-left text-[15px] font-medium text-foreground">
            {typed}
            {!reduced && (
              <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-foreground align-middle" />
            )}
          </p>
        </div>
        <div className="flex min-h-62 flex-col gap-2 p-4">
          {scene.candidates.map((candidate, i) => (
            <div
              key={`${sceneIndex}-${candidate.name}`}
              style={{
                transitionDelay: showResults
                  ? `${i * CARD_STAGGER_MS}ms`
                  : "0ms",
              }}
              className={cn(
                "flex items-center gap-4 rounded-xl border p-3.5 transition-all duration-500",
                showResults
                  ? "translate-y-0 opacity-100"
                  : "translate-y-3 opacity-0",
                i === 0
                  ? "border-foreground/25 bg-foreground/5"
                  : "border-foreground/10 bg-background",
              )}
            >
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                  i === 0
                    ? "bg-foreground text-background"
                    : "bg-foreground/5 text-foreground/60",
                )}
              >
                {candidate.name
                  .split(" ")
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-[15px] font-semibold text-foreground">
                    {candidate.name}
                  </p>
                  {i === 0 ? (
                    <span className="rounded-md bg-foreground px-1.5 py-0.5 text-[10px] font-bold text-background">
                      Best match
                    </span>
                  ) : null}
                </div>
                <p className="truncate text-left text-[13px] text-foreground/55">
                  {candidate.note}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-display text-lg font-bold text-foreground tabular-nums">
                  {candidate.pct}%
                </p>
                <div className="mt-1 h-1 w-14 overflow-hidden rounded-full bg-foreground/10">
                  <span
                    className="block h-full rounded-full bg-foreground transition-all duration-700"
                    style={{ width: showResults ? `${candidate.pct}%` : "0%" }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="relative mt-5 text-center text-sm text-foreground/55">
        Every answer comes from CVs and interview notes your agency already has.
      </p>
    </div>
  );
}
