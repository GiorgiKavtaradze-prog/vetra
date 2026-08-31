import "server-only";
import { assertValidOrgId } from "./tenant";

const AGENT_CONTEXT_SLUG = "vetra";
const DOC_TYPES = [
  "company",
  "job",
  "candidate",
  "application",
  "interview",
] as const;

export function orgScopedMcpUrl(orgId: string): string {
  assertValidOrgId(orgId);
  const base = process.env.SANITY_CONTEXT_MCP_BASE_URL;
  if (!base) throw new Error("SANITY_CONTEXT_MCP_BASE_URL is not set");
  const filter = `_type in [${DOC_TYPES.map((t) => `"${t}"`).join(", ")}] && orgId == "${orgId}" && !(_id in path("drafts.**"))`;
  const url = `${base}/${AGENT_CONTEXT_SLUG}?groqFilter=${encodeURIComponent(filter)}`;
  if (!url.includes("groqFilter=")) {
    throw new Error("MCP URL is missing the tenant filter");
  }
  return url;
}

const initialContextCache = new Map<string, { value: string; at: number }>();
const INITIAL_CONTEXT_TTL_MS = 10 * 60 * 1000;

export async function initialContextFor(orgId: string): Promise<string> {
  const cached = initialContextCache.get(orgId);
  if (cached && Date.now() - cached.at < INITIAL_CONTEXT_TTL_MS) {
    return cached.value;
  }
  const [path, query] = orgScopedMcpUrl(orgId).split("?");
  const res = await fetch(`${path}/initial-context?${query}`, {
    headers: {
      Authorization: `Bearer ${process.env.SANITY_API_READ_TOKEN}`,
    },
  });
  if (!res.ok) {
    throw new Error(`initial-context fetch failed: ${res.status}`);
  }
  const value = await res.text();
  initialContextCache.set(orgId, { value, at: Date.now() });
  return value;
}
