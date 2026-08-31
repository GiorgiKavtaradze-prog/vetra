"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import {
  Check,
  ChevronRight,
  Copy,
  Maximize2,
  Minimize2,
  Plus,
  Sparkles,
  Square,
  X,
} from "lucide-react";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { InitialsChip } from "@/components/initials-chip";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function screenKind(
  pathname: string,
): "companies" | "jobs" | "candidates" | null {
  return (
    (/^\/dashboard\/(companies|jobs|candidates)\/[^/]+/.exec(pathname)?.[1] as
      | "companies"
      | "jobs"
      | "candidates"
      | undefined) ?? null
  );
}

const KIND_LABELS = {
  companies: "Client",
  jobs: "Role",
  candidates: "Candidate",
} as const;

export function suggestionsFor(
  pathname: string,
  entity: string | null,
): string[] {
  const detail = screenKind(pathname);

  if (detail === "companies") {
    const name = entity ?? "this client";
    return [
      `Summarize the pipeline for ${name}`,
      `Who's stalled in screening at ${name}?`,
      `Which of ${name === "this client" ? "this client's" : `${name}'s`} roles still need candidates?`,
    ];
  }
  if (detail === "jobs") {
    const title = entity ?? "this role";
    return [
      `Who are the strongest matches for ${title}?`,
      `Who's been stuck on ${title} for over two weeks?`,
      `Summarize the interview feedback for ${title}`,
    ];
  }
  if (detail === "candidates") {
    const name = entity ?? "this candidate";
    return [
      `Summarize ${name}'s interview feedback`,
      `Which open roles fit ${name} best?`,
      `Where is ${name} in our pipelines right now?`,
    ];
  }
  if (pathname.startsWith("/dashboard/companies")) {
    return [
      "Which client has the most candidates in play?",
      "Which clients have open roles with no candidates yet?",
      "Summarize this month's activity across my clients",
    ];
  }
  if (pathname.startsWith("/dashboard/jobs")) {
    return [
      "Which roles are going stale?",
      "Where are candidates getting stuck right now?",
      "Which open roles have nobody past screening?",
    ];
  }
  if (pathname.startsWith("/dashboard/candidates")) {
    return [
      "Find React candidates with fintech experience",
      "Who joined the pool in the last two weeks?",
      "Who gave strong system-design answers recently?",
    ];
  }
  return [
    "What moved in my pipeline this week?",
    "Who's stalled in screening?",
    "Which candidates are closest to an offer?",
  ];
}

function actionsFor(pathname: string, entity: string | null): string[] {
  const detail = screenKind(pathname);
  if (detail === "companies" && entity) {
    return [
      `Draft the ${entity} update`,
      `Chase the stalled candidates at ${entity}`,
    ];
  }
  if (detail === "jobs" && entity) {
    return [`Shortlist matches for ${entity} from our pool`];
  }
  return [
    "Draft this week's client updates",
    "Chase everything stalled over 14 days",
  ];
}

function childrenText(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) {
    return children.filter((child) => typeof child === "string").join(" ");
  }
  return "";
}

function markdownToPlainText(md: string): string {
  return md
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*]\s+/gm, "• ")
    .replace(/^ *-{3,} *$/gm, "")
    .replace(/^\|.*\|$/gm, (row) =>
      row
        .split("|")
        .map((cell) => cell.trim())
        .filter((cell) => cell && !/^:?-+:?$/.test(cell))
        .join("  ·  "),
    )
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function legacyCopy(text: string): boolean {
  const area = document.createElement("textarea");
  area.value = text;
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  area.remove();
  return ok;
}

function CopyMessageButton({ text }: { text: string }) {
  const [copied, setCopied] = useState<"idle" | "copied" | "failed">("idle");
  return (
    <button
      type="button"
      onClick={async () => {
        const plain = markdownToPlainText(text);
        let ok = false;
        try {
          await navigator.clipboard.writeText(plain);
          ok = true;
        } catch {
          ok = legacyCopy(plain);
        }
        setCopied(ok ? "copied" : "failed");
        setTimeout(() => setCopied("idle"), 1800);
      }}
      className={cn(
        "flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 text-[11.5px] transition-colors",
        copied === "copied"
          ? "border-stage-hired/40 text-stage-hired"
          : copied === "failed"
            ? "border-rose-300 text-rose-700"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {copied === "copied" ? (
        <Check className="size-3" />
      ) : (
        <Copy className="size-3" />
      )}
      {copied === "copied"
        ? "Copied for sending"
        : copied === "failed"
          ? "Couldn't copy — select the text"
          : "Copy"}
    </button>
  );
}

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h3 className="border-t pt-3 text-[13px] font-semibold first:border-t-0 first:pt-0">
      {children}
    </h3>
  ),
  h2: ({ children }) => (
    <h3 className="border-t pt-3 text-[13px] font-semibold first:border-t-0 first:pt-0">
      {children}
    </h3>
  ),
  h3: ({ children }) => (
    <h4 className="text-[13px] font-semibold">{children}</h4>
  ),
  hr: () => <hr className="border-border my-1" />,
  a: ({ href, children }) => {
    const target = href ?? "#";
    if (/^\/dashboard\/(candidates|jobs|companies)\/[^/]+\/?$/.test(target)) {
      const label = childrenText(children);
      return (
        <Link
          href={target}
          className="bg-muted/50 hover:border-ai/30 hover:bg-ai-soft/50 hover:text-ai relative -my-0.5 inline-flex max-w-full items-center gap-1.5 rounded-full border py-px pr-2 pl-px align-middle text-[12px] font-medium no-underline transition-colors"
        >
          <InitialsChip
            name={label || "•"}
            size="sm"
            className="size-4.5 text-[8px]"
          />
          <span className="truncate">{children}</span>
        </Link>
      );
    }
    return (
      <Link
        href={target}
        className="text-ai font-medium underline underline-offset-2"
      >
        {children}
      </Link>
    );
  },
  table: ({ children }) => (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full border-collapse text-left text-[12.5px]">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
  th: ({ children }) => (
    <th className="text-muted-foreground border-b px-2.5 py-1.5 text-[11px] font-medium tracking-[0.04em] uppercase">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b px-2.5 py-1.5 align-top last:border-b">
      {children}
    </td>
  ),
  tr: ({ children }) => <tr className="last:[&>td]:border-b-0">{children}</tr>,
};

const TOOL_LABELS: Record<string, string> = {
  get_current_page: "Checking the screen you're on",
  navigate_to: "Taking you to the page",
  groq_query: "Searching your records",
  semantic_search: "Searching CVs and debriefs by meaning",
  get_document: "Reading a record",
  get_schema: "Checking the data model",
  create_company: "Adding the client",
  create_job: "Opening the role",
  create_candidate: "Adding the candidate",
  set_job_status: "Updating the role's status",
  archive_candidate: "Archiving the candidate",
  add_to_pipeline: "Adding them to a pipeline",
  move_application: "Moving them along the pipeline",
  log_interview: "Logging the interview",
};

function friendlyToolLabel(name: string): string {
  return (
    TOOL_LABELS[name] ??
    name.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase())
  );
}

function toolDetail(input: unknown): string | null {
  if (!input || typeof input !== "object") return null;
  const record = input as Record<string, unknown>;
  const text = [
    record.query,
    record.queryText,
    record.text,
    record.path,
    record.name,
  ].find((value) => typeof value === "string") as string | undefined;
  if (!text) return null;
  const types = [...text.matchAll(/_type\s*==\s*"(\w+)"/g)].map((m) => m[1]);
  if (types.length > 0) return [...new Set(types)].join(" + ");
  return text.length > 30 ? `${text.slice(0, 30)}…` : text;
}

type ReceiptState = "running" | "done" | "error";

function ToolReceipt({
  name,
  input,
  state,
}: {
  name: string;
  input: unknown;
  state: ReceiptState;
}) {
  const detail = toolDetail(input);
  return (
    <div className="border-ai/20 bg-ai-soft/60 relative overflow-hidden rounded-md border px-2.5 py-1.5 text-xs">
      <details className="group/receipt">
        <summary className="text-ai/90 flex cursor-pointer items-center gap-1.5 select-none [&::-webkit-details-marker]:hidden [&::marker]:content-none">
          {state === "running" ? (
            <span className="border-ai/30 border-t-ai size-3 shrink-0 animate-spin rounded-full border-2" />
          ) : state === "error" ? (
            <X className="size-3 shrink-0 text-rose-600" />
          ) : (
            <Check className="size-3 shrink-0" />
          )}
          <span className="min-w-0 truncate font-medium">
            {friendlyToolLabel(name)}
          </span>
          <span className="flex-1" />
          {detail ? (
            <span className="text-ai/60 max-w-[40%] truncate font-mono text-[10.5px]">
              {detail}
            </span>
          ) : null}
          <ChevronRight className="size-3 shrink-0 opacity-50 transition-transform group-open/receipt:rotate-90" />
        </summary>
        <div className="text-muted-foreground mt-1.5 font-mono text-[11px]">
          <p>{name}</p>
          <pre className="mt-1 max-h-48 overflow-auto break-all whitespace-pre-wrap">
            {JSON.stringify(input, null, 2)}
          </pre>
        </div>
      </details>
      {state === "running" ? (
        <span
          aria-hidden
          className="animate-vetra-sweep pointer-events-none absolute inset-y-0 left-1/4 w-1/2 bg-linear-to-r from-transparent via-white/60 to-transparent"
        />
      ) : null}
    </div>
  );
}

function UpgradeCard() {
  return (
    <div className="px-4">
      <Card className="border-ai/30">
        <CardHeader>
          <span className="bg-ai-soft text-ai w-fit rounded-md px-2 py-0.5 text-xs font-semibold">
            AI · Pro
          </span>
          <CardTitle className="font-display text-lg font-bold tracking-tight">
            The AI Talent Agent is on Pro
          </CardTitle>
          <CardDescription>
            Ask questions across your candidates, jobs and interviews — every
            answer cites the records it came from.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="bg-ai text-ai-foreground hover:bg-ai/90"
            nativeButton={false}
            render={<Link href="/dashboard/billing" />}
          >
            See plans
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function AgentChat({
  ask,
  onAskHandled,
  onStatus,
}: {
  ask: string | null;
  onAskHandled: () => void;
  onStatus: (status: { busy: boolean; entity: string | null }) => void;
}) {
  const [input, setInput] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const { messages, sendMessage, status, addToolOutput, stop, setMessages } =
    useChat({
      transport: new DefaultChatTransport({ api: "/api/agent" }),
      sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
      onToolCall({ toolCall }) {
        if (toolCall.dynamic) return;

        if (toolCall.toolName === "get_current_page") {
          const jobId = /^\/dashboard\/jobs\/([^/]+)/.exec(pathname)?.[1];
          const candidateId = /^\/dashboard\/candidates\/([^/]+)/.exec(
            pathname,
          )?.[1];
          addToolOutput({
            tool: "get_current_page",
            toolCallId: toolCall.toolCallId,
            output: {
              pathname,
              jobId: jobId ?? null,
              candidateId: candidateId ?? null,
            },
          });
          return;
        }

        if (toolCall.toolName === "navigate_to") {
          const { path } = toolCall.input as { path: string };
          if (!path.startsWith("/dashboard")) {
            addToolOutput({
              tool: "navigate_to",
              toolCallId: toolCall.toolCallId,
              output: { error: "Only /dashboard paths are allowed." },
            });
            return;
          }
          router.push(path);
          addToolOutput({
            tool: "navigate_to",
            toolCallId: toolCall.toolCallId,
            output: { ok: true, path },
          });
        }
      },
    });
  const busy = status === "submitted" || status === "streaming";
  const lastMessage = messages[messages.length - 1];
  const streamingText =
    lastMessage?.role === "assistant" &&
    lastMessage.parts.some(
      (part) => part.type === "text" && part.text.trim().length > 0,
    );

  const [entityName, setEntityName] = useState<string | null>(null);
  useEffect(() => {
    if (!screenKind(pathname)) {
      setEntityName(null);
      return;
    }
    let tries = 0;
    const timer = setInterval(() => {
      const text = document.querySelector("main h1")?.textContent?.trim();
      if (text) {
        setEntityName(text);
        clearInterval(timer);
      } else if (++tries >= 20) {
        clearInterval(timer);
      }
    }, 300);
    return () => clearInterval(timer);
  }, [pathname]);

  const kind = screenKind(pathname);
  const suggestions = suggestionsFor(pathname, entityName);
  const actions = actionsFor(pathname, entityName);

  useEffect(() => {
    onStatus({ busy, entity: entityName });
  }, [busy, entityName, onStatus]);

  useEffect(() => {
    if (!ask || busy) return;
    sendMessage({ text: ask });
    onAskHandled();
  }, [ask, busy]);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    sendMessage({ text });
    setInput("");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {messages.length > 0 ? (
        <button
          type="button"
          onClick={() => {
            if (!busy) setMessages([]);
          }}
          className="text-muted-foreground hover:text-foreground absolute top-3.5 right-12 flex size-6.5 cursor-pointer items-center justify-center rounded-md transition-colors md:right-20"
          aria-label="New thread"
          title="New thread"
        >
          <Plus className="size-4" />
        </button>
      ) : null}

      <div ref={scrollRef} className="flex-1 space-y-3.5 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex flex-col gap-4 pt-1">
            {kind && entityName ? (
              <div className="bg-muted/40 flex items-center gap-2.5 rounded-lg border px-3 py-2.5">
                <InitialsChip name={entityName} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold">
                    {entityName}
                  </p>
                  <p className="text-muted-foreground text-[11.5px]">
                    {KIND_LABELS[kind]} · the screen you&apos;re on
                  </p>
                </div>
              </div>
            ) : null}
            <div className="flex flex-col gap-1.5">
              <p className="text-muted-foreground/80 font-mono text-[10px] tracking-[0.14em] uppercase">
                Start here
              </p>
              {suggestions.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={busy}
                  onClick={() => sendMessage({ text: prompt })}
                  className="hover:border-ai/30 hover:bg-ai-soft/40 flex w-full cursor-pointer items-center rounded-lg border px-2.5 py-2 text-left text-[13px] transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-muted-foreground/80 font-mono text-[10px] tracking-[0.14em] uppercase">
                Do something
              </p>
              <div className="flex flex-wrap gap-1.5">
                {actions.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    disabled={busy}
                    onClick={() => sendMessage({ text: prompt })}
                    className="border-ai/25 bg-ai-soft/50 text-ai hover:bg-ai-soft cursor-pointer rounded-md border px-2.5 py-1.5 text-left text-xs font-medium transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "space-y-2 text-sm",
              message.role === "user" &&
                "bg-muted ml-auto w-fit max-w-[85%] rounded-lg rounded-br-sm px-3 py-2",
            )}
          >
            {message.parts.map((part, i) => {
              if (part.type === "text") {
                return message.role === "user" ? (
                  <p key={i}>{part.text}</p>
                ) : (
                  <div
                    key={i}
                    className="space-y-2.5 leading-relaxed [&_ol]:list-decimal [&_ol]:pl-4 [&_ul]:list-disc [&_ul]:pl-4"
                  >
                    <Markdown
                      remarkPlugins={[remarkGfm]}
                      components={markdownComponents}
                    >
                      {part.text}
                    </Markdown>
                  </div>
                );
              }
              if (
                part.type === "dynamic-tool" ||
                part.type.startsWith("tool-")
              ) {
                const toolPart = part as {
                  type: string;
                  toolName?: string;
                  input?: unknown;
                  state?: string;
                };
                const name =
                  toolPart.toolName ?? toolPart.type.slice("tool-".length);
                const state: ReceiptState =
                  toolPart.state === "output-error"
                    ? "error"
                    : toolPart.state === "output-available"
                      ? "done"
                      : "running";
                return (
                  <ToolReceipt
                    key={i}
                    name={name}
                    input={toolPart.input}
                    state={state}
                  />
                );
              }
              return null;
            })}
            {message.role === "assistant" &&
            !(busy && message === lastMessage) &&
            message.parts.some(
              (part) => part.type === "text" && part.text.trim().length > 0,
            ) ? (
              <div className="pt-0.5">
                <CopyMessageButton
                  text={message.parts
                    .filter(
                      (part): part is { type: "text"; text: string } =>
                        part.type === "text",
                    )
                    .map((part) => part.text)
                    .join("\n\n")}
                />
              </div>
            ) : null}
          </div>
        ))}

        {busy && !streamingText && (
          <div className="flex items-center gap-2.5" aria-live="polite">
            <span className="bg-ai-soft text-ai flex size-6 shrink-0 items-center justify-center rounded-full">
              <Sparkles className="size-3 animate-pulse" />
            </span>
            <span className="text-muted-foreground text-[13px]">
              Vetra is searching your records
            </span>
            <span className="flex items-center gap-1" aria-hidden>
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="bg-ai/50 size-1 animate-bounce rounded-full"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </span>
          </div>
        )}

        {busy ? (
          <button
            type="button"
            onClick={() => stop()}
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors"
          >
            <Square className="size-2.5 fill-current" />
            Stop
          </button>
        ) : null}

        {!busy && messages.length > 0 && lastMessage?.role === "assistant" ? (
          <div className="flex flex-col gap-1.5 border-t pt-3">
            <p className="text-muted-foreground/80 font-mono text-[10px] tracking-[0.14em] uppercase">
              Next
            </p>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.slice(0, 3).map((prompt, index) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage({ text: prompt })}
                  className={cn(
                    "cursor-pointer rounded-md border px-2.5 py-1.5 text-left text-xs transition-colors",
                    index === 0
                      ? "border-ai/25 bg-ai-soft/50 text-ai hover:bg-ai-soft font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 border-t p-4">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            busy
              ? "Vetra is working — one moment"
              : "Ask about your candidates and jobs"
          }
          disabled={busy}
        />
        <Button
          type="submit"
          className="bg-ai text-ai-foreground hover:bg-ai/90"
          disabled={busy || !input.trim()}
        >
          Ask
          <kbd className="font-mono text-[10px] opacity-70">⏎</kbd>
        </Button>
      </form>
    </div>
  );
}

export function AgentPanel({ allowed }: { allowed: boolean }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [ask, setAsk] = useState<string | null>(null);

  useEffect(() => {
    if (open && expanded) {
      document.body.setAttribute("data-vetra-expanded", "");
    } else {
      document.body.removeAttribute("data-vetra-expanded");
    }
    return () => document.body.removeAttribute("data-vetra-expanded");
  }, [open, expanded]);
  const [chatStatus, setChatStatus] = useState<{
    busy: boolean;
    entity: string | null;
  }>({ busy: false, entity: null });

  useEffect(() => {
    function onAsk(event: Event) {
      const text = (event as CustomEvent<{ text?: string }>).detail?.text;
      if (!text) return;
      setOpen(true);
      setAsk(text);
    }
    window.addEventListener("vetra:ask", onAsk);
    return () => window.removeEventListener("vetra:ask", onAsk);
  }, []);

  return (
    <>
      <Button
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className={cn(
          "bg-ai text-ai-foreground hover:bg-ai/90 shadow-ai/40 fixed right-6 bottom-6 z-60 h-12 rounded-full px-5 shadow-lg transition-transform hover:scale-[1.03]",
          open && expanded && "hidden",
        )}
      >
        <Sparkles className="size-4" />
        Ask Vetra
      </Button>

      <div
        role="dialog"
        aria-label="Ask Vetra"
        inert={!open}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
        className={cn(
          "bg-card fixed z-60 flex flex-col overflow-hidden border shadow-2xl transition-all duration-300",
          expanded
            ? "inset-y-0 right-0 h-dvh max-h-none w-[min(428px,100vw)] rounded-none border-y-0 border-r-0"
            : "right-4 bottom-24 h-150 max-h-[calc(100dvh-8rem)] w-[min(420px,calc(100vw-2rem))] rounded-2xl sm:right-6",
          open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0",
        )}
      >
        <div className="relative flex items-center justify-between gap-3 border-b px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="bg-ai-soft text-ai relative flex size-6.5 items-center justify-center rounded-md">
              {!chatStatus.busy ? (
                <span
                  aria-hidden
                  className="border-ai/40 absolute inset-0 animate-ping rounded-md border animation-duration-[2.6s]"
                />
              ) : null}
              <Sparkles className="size-3.5" />
            </span>
            <div>
              <p className="text-sm font-semibold tracking-tight">Ask Vetra</p>
              {chatStatus.busy ? (
                <p className="text-ai flex items-center gap-1.5 text-[11.5px]">
                  Searching your records
                  <span className="flex items-center gap-0.5" aria-hidden>
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        className="bg-ai size-0.75 animate-bounce rounded-full"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </span>
                </p>
              ) : (
                <p className="text-muted-foreground flex items-center gap-1.5 text-[11.5px]">
                  <span className="bg-ai size-0.75 animate-pulse rounded-full" />
                  {chatStatus.entity ?? "Reading this page"}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              aria-label={
                expanded ? "Restore floating panel" : "Expand to sidebar"
              }
              title={expanded ? "Restore" : "Expand"}
              onClick={() => setExpanded((current) => !current)}
              className="hidden md:inline-flex"
            >
              {expanded ? (
                <Minimize2 className="size-4" />
              ) : (
                <Maximize2 className="size-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
            >
              <X className="size-4" />
            </Button>
          </div>
          {chatStatus.busy ? (
            <span
              aria-hidden
              className="animate-vetra-sweep via-ai absolute right-0 -bottom-px left-0 h-px bg-linear-to-r from-transparent to-transparent"
            />
          ) : null}
        </div>
        {allowed ? (
          <AgentChat
            ask={ask}
            onAskHandled={() => setAsk(null)}
            onStatus={setChatStatus}
          />
        ) : (
          <div className="py-4">
            <UpgradeCard />
          </div>
        )}
      </div>
    </>
  );
}
