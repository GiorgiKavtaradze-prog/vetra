import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvLocal(): Record<string, string> {
  let raw: string;
  try {
    raw = readFileSync(resolve(ROOT, ".env.local"), "utf8");
  } catch {
    console.error("Could not read .env.local at the repo root.");
    process.exit(1);
  }
  const env: Record<string, string> = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const env = loadEnvLocal();
const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = env.NEXT_PUBLIC_SANITY_DATASET;
const token = env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env vars. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET and SANITY_API_WRITE_TOKEN in .env.local.",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2026-08-01",
  useCdn: false,
});

const args = process.argv.slice(2);
const orgId = args.find((a) => !a.startsWith("--"));
const wantsReset = args.includes("--reset");

if (!orgId || !/^org_[A-Za-z0-9]+$/.test(orgId)) {
  console.error(
    [
      "Usage:",
      "  npm run seed -- <orgId>          seed demo data (idempotent, safe to re-run)",
      "  npm run seed:reset -- <orgId>    delete ONLY the seeded documents",
      "",
      "orgId is your Clerk organization id (starts with org_).",
      "Find it in the Clerk Dashboard under Organizations -> your org -> Organization ID,",
      "or with the Clerk CLI: clerk api /organizations",
    ].join("\n"),
  );
  process.exit(1);
}

type SeedDoc = { _id: string; _type: string; [key: string]: unknown };

const DAY_MS = 86_400_000;
const daysAgo = (days: number) =>
  new Date(Date.now() - days * DAY_MS).toISOString();

const sid = (...parts: (string | number)[]) =>
  ["vetra.seed", orgId, ...parts].join(".");

const ref = (_ref: string) => ({ _type: "reference", _ref });
const pad = (n: number) => String(n).padStart(3, "0");
const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

type CompanySeed = {
  key: string;
  name: string;
  website: string;
  industry: string;
  notes: string;
};

const companies: CompanySeed[] = [
  {
    key: "lumapay",
    name: "Lumapay",
    website: "https://lumapay.io",
    industry: "Fintech",
    notes:
      "Series C payments platform, ~400 heads, London + Vilnius. Hiring manager is Dana Whitmore (VP Eng) — decisive, replies same day, hates long shortlists. Wants payments or broader fintech domain experience wherever possible and is allergic to candidates with four jobs in three years. 22% fee agreed, 12-week rebate.",
  },
  {
    key: "helixcare",
    name: "Helixcare",
    website: "https://helixcare.health",
    industry: "Healthtech",
    notes:
      "Care-coordination platform selling into NHS trusts. Interview loops are slow because clinical safety sign-off sits with Dr. Naomi Field, who travels a lot. Candidates need patience and ideally some regulated-data background. They pay invoices net-60 — chase finance early.",
  },
  {
    key: "bloomforage",
    name: "Bloom & Forage",
    website: "https://bloomandforage.com",
    industry: "E-commerce",
    notes:
      "DTC food and lifestyle brand, Shopify-plus-headless stack, profitable and fussy about culture. Poppy Lane (Head of Digital) makes gut-feel calls fast, sometimes too fast. Salaries sit slightly under market but the brand sells itself to candidates who know it.",
  },
  {
    key: "stackline",
    name: "Stackline Labs",
    website: "https://stacklinelabs.dev",
    industry: "Developer tools",
    notes:
      "Seed-strapped dev-tools startup building a CI observability product. Ana Duarte (CTO) runs a brutal but fair system-design round — prep candidates properly or they burn. Equity-heavy offers; base tops out fast, so probe comp expectations before submitting anyone.",
  },
  {
    key: "portside",
    name: "Portside Logistics",
    website: "https://portsidelogistics.co.uk",
    industry: "Logistics",
    notes:
      "Felixstowe-based freight and warehousing group modernising a big legacy estate. Gavin Shaw (Head of IT) is ex-military, values punctuality over polish. Fully on-site Tuesdays and Thursdays, which loses us about a third of candidates — say it up front.",
  },
  {
    key: "nimbus",
    name: "Nimbus Media",
    website: "https://nimbusmedia.tv",
    industry: "Media & streaming",
    notes:
      "Sports-highlights streaming service, traffic is extremely spiky around fixtures. Elliot Fry (Eng Director) loves generalists who have shipped under load. Offers move quickly once he decides. 20% fee, exclusive on engineering roles until December.",
  },
  {
    key: "voltgrid",
    name: "Voltgrid Energy",
    website: "https://voltgrid.energy",
    industry: "Climate & energy",
    notes:
      "EV-charging and grid-balancing scale-up, Go shop, strong mission pull. Karl Jensen (Platform Lead) interviews on real production incidents rather than puzzles — candidates either love it or freeze. They will stretch comp for genuine distributed-systems depth.",
  },
  {
    key: "brickrow",
    name: "Brickrow",
    website: "https://brickrow.homes",
    industry: "Proptech",
    notes:
      "Lettings-management platform for mid-size agencies. Owen Price (CTO) is a straight talker and moves in days, not weeks. Budget bands are rigid — do not submit anyone above band hoping he will stretch, he will not.",
  },
];

type JobSeed = {
  key: string;
  title: string;
  company: string;
  seniority: string;
  salaryRange: string;
  status: "open" | "closed";
  createdDays: number;
  description: string;
};

const jobs: JobSeed[] = [
  {
    key: "sfe-lumapay",
    title: "Senior Frontend Engineer",
    company: "lumapay",
    seniority: "senior",
    salaryRange: "£85,000–£105,000 + equity",
    status: "open",
    createdDays: 68,
    description:
      "Own the merchant-facing payments dashboard: React 19, TypeScript, a home-grown design system and some latency-sensitive checkout flows. The team is rebuilding reconciliation views used by 8,000 merchants daily, so real product judgement matters as much as rendering performance. Dana wants someone who has worked near money before — payments, banking or trading — and can push back on design when the data model disagrees.",
  },
  {
    key: "be-payments-lumapay",
    title: "Backend Engineer, Payments",
    company: "lumapay",
    seniority: "mid",
    salaryRange: "£70,000–£85,000",
    status: "open",
    createdDays: 55,
    description:
      "Node/TypeScript services behind the ledger: PSP integrations (Stripe, Adyen, GoCardless), idempotent webhook processing and double-entry bookkeeping. Plenty of scope to grow — the team pairs heavily and the staff engineers actually mentor. Correctness obsession beats raw speed here; they ask hard questions about retries and exactly-once semantics.",
  },
  {
    key: "staff-platform-stackline",
    title: "Staff Platform Engineer",
    company: "stackline",
    seniority: "staff",
    salaryRange: "£120,000–£140,000 + significant equity",
    status: "open",
    createdDays: 70,
    description:
      "First dedicated platform hire. Own the ingestion pipeline that swallows CI event streams from thousands of repos, the multi-tenant storage layer beneath it, and the paved road the product teams build on. Ana's system-design bar is the highest we work with — she wants someone who reasons about failure modes unprompted and has run something real at scale.",
  },
  {
    key: "devops-portside",
    title: "DevOps Engineer",
    company: "portside",
    seniority: "mid",
    salaryRange: "£65,000–£78,000",
    status: "open",
    createdDays: 50,
    description:
      "Drag a freight-forwarding estate from hand-managed VMs to Terraform and containers without breaking the warehouse management system that runs three shifts a day. Azure-heavy, some on-prem that will never fully die. Suits someone pragmatic who enjoys legacy modernisation more than greenfield purity. On-site in Felixstowe Tuesdays and Thursdays.",
  },
  {
    key: "data-eng-helixcare",
    title: "Senior Data Engineer",
    company: "helixcare",
    seniority: "senior",
    salaryRange: "£90,000–£105,000",
    status: "open",
    createdDays: 60,
    description:
      "Build the pipelines that move patient-pathway data between NHS trusts and Helixcare's analytics platform — FHIR feeds, event streams, dbt models, strict information-governance constraints. The role needs someone who treats data quality as a clinical-safety issue, because here it genuinely is. IG training provided; prior regulated-data experience shortens onboarding a lot.",
  },
  {
    key: "pm-growth-bloom",
    title: "Product Manager, Growth",
    company: "bloomforage",
    seniority: "senior",
    salaryRange: "£80,000–£95,000",
    status: "open",
    createdDays: 48,
    description:
      "Own the funnel from first visit to second purchase: experimentation programme, subscription mechanics, retention levers. Small squad (four engineers, one designer) with real autonomy and a founder who reads every experiment write-up. Needs someone fluent in numbers who can also hold their own in a room full of brand people.",
  },
  {
    key: "fullstack-nimbus",
    title: "Fullstack Engineer",
    company: "nimbus",
    seniority: "mid",
    salaryRange: "£70,000–£82,000",
    status: "open",
    createdDays: 88,
    description:
      "TypeScript across the stack — Next.js front of house, Node services behind, Postgres underneath. Traffic spikes 40x when a match ends and the highlights drop, so caching and graceful degradation are daily conversations, not interview trivia. Elliot wants shipped-under-pressure stories, not framework tourism.",
  },
  {
    key: "be-go-voltgrid",
    title: "Senior Backend Engineer (Go)",
    company: "voltgrid",
    seniority: "senior",
    salaryRange: "£95,000–£115,000",
    status: "open",
    createdDays: 52,
    description:
      "Charge-point telemetry and grid-balancing services in Go: tens of thousands of devices phoning home, event-driven core, hard real-time-ish constraints when the grid operator calls for load shedding. Karl interviews on genuine past incidents — bring scars. Strong distributed-systems candidates get stretched comp.",
  },
  {
    key: "fe-bloom",
    title: "Frontend Engineer",
    company: "bloomforage",
    seniority: "mid",
    salaryRange: "£55,000–£68,000",
    status: "open",
    createdDays: 78,
    description:
      "Headless storefront work: React, a Shopify backend, heavy emphasis on Core Web Vitals because every 100ms costs measurable revenue. The design team is genuinely good, so this suits an engineer who enjoys polishing interaction details rather than fighting for them. Accessibility literacy is a real plus — the brand has committed publicly to WCAG 2.2 AA.",
  },
  {
    key: "eng-lead-helixcare",
    title: "Engineering Lead, Care Platform",
    company: "helixcare",
    seniority: "lead",
    salaryRange: "£110,000–£125,000",
    status: "open",
    createdDays: 58,
    description:
      "Lead two squads (nine engineers) building the care-coordination product. Half delivery leadership, half technical direction — the platform is mid-migration from a Django monolith to services and needs someone who has run that movie before. Reports to the CTO; clinical stakeholders are demanding and lovely in roughly equal measure.",
  },
  {
    key: "sre-stackline",
    title: "Site Reliability Engineer",
    company: "stackline",
    seniority: "senior",
    salaryRange: "£95,000–£110,000",
    status: "open",
    createdDays: 49,
    description:
      "Own reliability for the ingestion and query path: SLOs, incident process, capacity planning, and killing the 3am pages at the root. Kubernetes on GCP, Prometheus/Grafana, a growing Terraform estate. Ana wants an engineer who automates themselves out of toil and writes post-mortems people actually read.",
  },
  {
    key: "be-brickrow",
    title: "Backend Engineer",
    company: "brickrow",
    seniority: "mid",
    salaryRange: "£68,000–£80,000",
    status: "open",
    createdDays: 82,
    description:
      "Core lettings APIs: tenancy workflows, rent collection, deposit protection integrations. Node and Postgres, a codebase that is honest about its debt and a CTO who prioritises paying it down. Rigid salary band — Owen will not stretch, so calibrate expectations before submitting.",
  },
  {
    key: "ds-nimbus",
    title: "Data Scientist, Recommendations",
    company: "nimbus",
    seniority: "senior",
    salaryRange: "£85,000–£100,000",
    status: "closed",
    createdDays: 85,
    description:
      "Personalised highlights ranking — collaborative filtering today, a long roadmap of contextual models tomorrow. Closed: filled internally when their analytics lead moved across. Keep the shortlist warm; Elliot hinted a second opening may appear after the rights renewal in Q4.",
  },
  {
    key: "qa-portside",
    title: "QA Engineer",
    company: "portside",
    seniority: "junior",
    salaryRange: "£38,000–£45,000",
    status: "closed",
    createdDays: 75,
    description:
      "Manual-plus-automation QA across the warehouse management rollout. Closed: role pulled when the rollout slipped a quarter and the budget moved with it. Gavin expects to reopen it in the new financial year.",
  },
  {
    key: "fs-brickrow",
    title: "Senior Fullstack Engineer",
    company: "brickrow",
    seniority: "senior",
    salaryRange: "£85,000–£95,000",
    status: "closed",
    createdDays: 90,
    description:
      "Senior TypeScript generalist across the lettings platform. Closed: filled via our shortlist in under three weeks — Owen took the second candidate we sent. Good reference client for pace; use this outcome in pitches.",
  },
];

// ---------------------------------------------------------------------------
// Candidates
// ---------------------------------------------------------------------------

type CandidateSeed = {
  n: number;
  name: string;
  email: string;
  headline: string;
  skills: string[];
  source: "referral" | "linkedin" | "job-board" | "outreach" | "other";
  addedDays: number; // floor — pushed earlier automatically if applications predate it
  archived?: boolean;
  cv: string;
};

const candidates: CandidateSeed[] = [
  {
    n: 1,
    name: "Priya Raghavan",
    email: "priya.raghavan@gmail.com",
    headline: "Senior React engineer, 6 years in fintech dashboards",
    skills: [
      "React",
      "TypeScript",
      "Next.js",
      "GraphQL",
      "Storybook",
      "Jest",
      "Design systems",
    ],
    source: "linkedin",
    addedDays: 26,
    cv: `Senior frontend engineer at Monzo (2.5 years), currently on the wealth team building investment dashboards in React 19 and TypeScript. Before that, three years at Revolut on the business-banking web app, where she led the migration from a sprawling Redux codebase to server components and cut the checkout bundle by 61%. Started her career at a small Bangalore fintech building charting tools for retail traders.

Strong on design systems — she maintains Monzo's internal component library alongside product work, and her Storybook-driven workflow talk from React Advanced 2024 still gets shared around. Comfortable owning features end to end: she scoped and shipped a real-time portfolio view (WebSockets, optimistic updates, reconciliation on refocus) that now serves 300k users daily with a p95 render under 120ms.

BSc Computer Science, University of Madras. Based in London, hybrid preferred, one month notice. Motivated by product depth rather than title — she has turned down two staff-title offers at companies whose products she found dull. Wants to stay near money movement; genuinely lights up talking about payment flows.`,
  },
  {
    n: 2,
    name: "Tom Whitfield",
    email: "tom.whitfield@outlook.com",
    headline: "Backend engineer (Node/TypeScript), payments and billing",
    skills: [
      "Node.js",
      "TypeScript",
      "PostgreSQL",
      "Stripe API",
      "Redis",
      "AWS",
      "Kafka",
    ],
    source: "job-board",
    addedDays: 22,
    cv: `Backend engineer with five years across billing and payments. Currently at Paddle on the subscriptions team — owns the proration engine and the dunning flows, which recover roughly £2m a year in failed payments. Previously at a Bristol agency where he built Stripe integrations for a dozen clients and learned, in his words, "every way a webhook can lie to you".

Day to day: Node, TypeScript, Postgres, Redis, a bit of Kafka for billing events. He is the person on his team who reviews anything touching money because he genuinely enjoys idempotency edge cases. Wrote Paddle's internal guide to safe retries. Less experienced with infrastructure — he can read Terraform but has always had a platform team.

Career goal is a senior title within eighteen months at a company where payments is the product rather than a cost centre. Bath-based, in London two days a week without complaint. Four weeks notice. Salary expectation £80k, flexible for the right learning environment. Engaging in person — dry sense of humour, references will be strong.`,
  },
  {
    n: 3,
    name: "Amara Okafor",
    email: "amara.okafor@protonmail.com",
    headline:
      "Fullstack engineer, TypeScript end to end, healthtech background",
    skills: [
      "TypeScript",
      "React",
      "Node.js",
      "PostgreSQL",
      "FHIR",
      "Docker",
      "tRPC",
    ],
    source: "referral",
    addedDays: 30,
    cv: `Fullstack engineer, seven years, the last three at Accurx building patient-communication tools used across most GP practices in England. Ships across the whole stack — React front ends, Node services, Postgres schemas she designs herself — and has the rare healthtech combination of product speed and information-governance literacy. Led the build of a batch-messaging feature that went from discovery to national rollout in nine weeks and now sends 4m messages a month.

Earlier career at a Lagos fintech (two years, mobile money APIs) then an MSc at Edinburgh. That mix shows: she is pragmatic about shipping but rigorous where data sensitivity demands it, and she can explain FHIR resource modelling to a non-technical stakeholder without condescension.

Referred by a former Accurx colleague we placed last year, who called her "the engineer everyone quietly routes hard problems to". Looking for a senior fullstack role with real ownership; healthtech preferred but not required. London, hybrid, eight weeks notice. Runs a small mentoring circle for Nigerian women entering UK tech.`,
  },
  {
    n: 4,
    name: "Daniel Kovacs",
    email: "d.kovacs.ops@gmail.com",
    headline:
      "DevOps engineer — Kubernetes, Terraform, Azure; visa sponsorship needed",
    skills: [
      "Kubernetes",
      "Terraform",
      "Azure",
      "Helm",
      "GitHub Actions",
      "Prometheus",
      "Bash",
    ],
    source: "job-board",
    addedDays: 28,
    cv: `Hungarian DevOps engineer, six years, currently at a Budapest managed-services provider running Azure estates for German manufacturing clients. Deep Kubernetes and Terraform: he rebuilt the firm's client-onboarding stack as reusable modules, cutting new-environment spin-up from two weeks to a day and a half. Comfortable being the only ops person in the room — most of his clients had no internal platform team at all.

Genuinely good at legacy coexistence, which is rarer than greenfield skill: one client migration involved keeping a 2009-era ERP on-prem while everything around it moved to AKS, zero unplanned downtime across fourteen months. Prometheus and Grafana for monitoring; opinionated about alert hygiene ("an alert nobody acts on is a bug").

Needs UK visa sponsorship (Skilled Worker route — straightforward, he has done the research and can start the process immediately). English is excellent, slight formality in writing that disappears on calls. Available on four weeks notice. Salary expectation £70–75k, aware sponsorship narrows his options and priced accordingly. Wants a product company after years of agency-style rotation.`,
  },
  {
    n: 5,
    name: "Sofia Marchetti",
    email: "sofia.marchetti@icloud.com",
    headline:
      "Senior data engineer — Spark, dbt, Airflow, lakehouse migrations",
    skills: [
      "Python",
      "Spark",
      "dbt",
      "Airflow",
      "Snowflake",
      "AWS",
      "Data modelling",
    ],
    source: "linkedin",
    addedDays: 27,
    cv: `Senior data engineer, eight years, currently at Ocado Technology on the fulfilment-analytics platform. Owns pipelines that process 2bn warehouse telemetry events a day into Snowflake; led the migration from a crumbling Redshift estate to a lakehouse architecture, delivered two months early and 40% under the projected compute budget. Previous roles at Sky (customer-data platform) and a Milan consultancy.

Strengths: dimensional modelling that analysts actually enjoy using, dbt discipline (she introduced contract testing between models at Ocado), and a habit of sitting with downstream consumers before building anything. Weaknesses she volunteers herself: limited streaming experience beyond basic Kafka consumers, and no interest in people management yet.

MSc Data Engineering, Politecnico di Milano. Settled status, no visa considerations. Based in St Albans, happy with two London days. Twelve weeks notice — Ocado holds people to it. Looking for a domain with human stakes; she mentioned healthcare unprompted twice on our call. Salary £95k+, firm, and worth it on the evidence.`,
  },
  {
    n: 6,
    name: "James O'Donnell",
    email: "james.odonnell@fastmail.com",
    headline:
      "Staff engineer — platform and distributed systems, ex-Cloudflare",
    skills: [
      "Go",
      "Kubernetes",
      "Distributed systems",
      "gRPC",
      "Terraform",
      "PostgreSQL",
      "System design",
    ],
    source: "outreach",
    addedDays: 45,
    cv: `Staff platform engineer, eleven years. Four years at Cloudflare on the edge-configuration delivery system — the pipeline that pushes customer config to hundreds of PoPs in under five seconds, globally, with strict correctness guarantees. He led the redesign that took propagation p99 from 40s to 4s and wrote the internal design doc that is still cited in onboarding. Before Cloudflare: Deliveroo (dispatch systems during the 2018–2020 scaling sprint) and ThoughtWorks.

The strongest system-design candidate on our books. Reasons naturally in failure modes, backpressure and blast radius; interviews at his level tend to turn into engineering conversations the panel enjoys. Prefers building paved roads over hero debugging, and has strong opinions about platform teams serving product teams rather than ruling them.

Left Cloudflare in June after his team was reorganised under a manager he respected less than the mission. Not urgent — he is choosing carefully and two other processes are live. Dublin-born, London-based, no visa needs. Wants genuine staff scope: architecture ownership, not a tech-lead-in-disguise role. Comp expectation £135k+ or meaningful equity at an earlier stage.`,
  },
  {
    n: 7,
    name: "Mei-Ling Chen",
    email: "meiling.chen.dev@gmail.com",
    headline: "Frontend engineer — React, performance and storefronts",
    skills: [
      "React",
      "TypeScript",
      "Next.js",
      "Tailwind CSS",
      "Web Vitals",
      "Playwright",
    ],
    source: "job-board",
    addedDays: 21,
    cv: `Frontend engineer, four years, currently at ASOS on the product-page team. Lives in the intersection of React and Core Web Vitals: she ran the image-loading overhaul that improved LCP by 800ms on mid-range Android devices and moved conversion by a measurable 1.9%. Fluent in the modern stack — Next.js app router, server components, Tailwind — and writes Playwright suites that other teams copy.

Before ASOS, two years at a Manchester agency shipping Shopify storefronts for fashion brands, which left her with genuine sympathy for content editors and a hatred of hydration bugs. She prototypes in code rather than Figma and pairs well with designers because she asks about intent, not pixels.

BEng from the University of Hong Kong, moved to the UK in 2019, indefinite leave to remain secured last year. Manchester-based, wants remote-first with occasional travel; will do one London day a week. Four weeks notice. Looking for a smaller company where frontend is respected as product work rather than styling. Salary expectation around £65k.`,
  },
  {
    n: 8,
    name: "Lukas Bergström",
    email: "lukas.bergstrom@hey.com",
    headline:
      "Senior Go engineer — distributed systems, IoT telemetry at scale",
    skills: [
      "Go",
      "Kafka",
      "TimescaleDB",
      "gRPC",
      "Kubernetes",
      "NATS",
      "System design",
    ],
    source: "linkedin",
    addedDays: 33,
    cv: `Senior backend engineer from Gothenburg, nine years, the last four at Einride (autonomous freight) building vehicle-telemetry ingestion in Go: 30k vehicles streaming position, battery and diagnostic data through NATS and Kafka into TimescaleDB. He designed the store-and-forward layer that keeps trucks operational through cellular dead zones and reconciles cleanly on reconnect — a genuinely hard exactly-once problem he can discuss for an hour without notes.

Earlier: Spotify (playback infrastructure, two years) and a Stockholm consultancy. Strong system-design fundamentals with the practical scars to back them — he ran the incident response when a malformed firmware rollout tripled message volume overnight, and his post-mortem process became the company template.

Moved to Edinburgh last year for his partner's research post; no visa issues (pre-settled status). Fully remote preferred, monthly travel fine. Three months notice, negotiable to two. Motivated by climate-adjacent work — he shortlisted us specifically because we listed an energy client. Calm, precise, slightly understated on first call; do not mistake it for lack of depth.`,
  },
  {
    n: 9,
    name: "Hannah Pryce",
    email: "hannah.pryce@outlook.com",
    headline: "Growth PM — marketplaces and subscriptions, experiment-led",
    skills: [
      "Experimentation",
      "SQL",
      "Amplitude",
      "Retention strategy",
      "A/B testing",
      "Stakeholder management",
    ],
    source: "referral",
    addedDays: 19,
    cv: `Growth product manager, six years. Currently at Cazoo's successor team after the restructure, previously three formative years at Gousto where she owned the post-first-box journey: her menu-personalisation experiments lifted second-order conversion by 14% and she still gets recognised for the "skip vs cancel" flow redesign that cut churn measurably. Started as an analyst at Dunnhumby, so her SQL is real — she pulls her own cohorts rather than queueing for a data team.

Runs a disciplined experiment cadence: hypothesis docs, pre-registered success metrics, honest write-ups of the 60% that fail. Engineers like working with her because she brings problems, not tickets. Weakness by her own admission: brand and above-the-line marketing bore her, so pure acquisition roles are a poor fit.

Referred by a Gousto engineering manager we know well. Cardiff-based, in London weekly without fuss. One month notice. Wants a DTC or subscription business where growth is a product discipline rather than a marketing afterthought. Salary £85–90k. Interviews extremely well — warm, structured, numbers at her fingertips.`,
  },
  {
    n: 10,
    name: "Rashid Al-Farsi",
    email: "rashid.alfarsi@gmail.com",
    headline:
      "SRE, ex-banking infrastructure — reliability with an audit trail",
    skills: [
      "Kubernetes",
      "Prometheus",
      "Terraform",
      "Go",
      "Python",
      "Incident management",
      "GCP",
    ],
    source: "outreach",
    addedDays: 40,
    cv: `Site reliability engineer, eight years, the last five at Barclays running platform reliability for the payments gateway estate — the systems that clear a meaningful slice of UK card traffic. Led the SLO programme across 40 services, built the error-budget policy that finally gave teams cover to say no to features, and ran major-incident command for events measured in headlines-averted. Before banking: two years at a hosting provider doing old-fashioned Linux ops, which still shows in his debugging instincts.

Technically: Kubernetes (on-prem and GCP), Prometheus/Thanos, Terraform, automation in Go and Python. He is strongest on process and calm — the person you want holding the bridge call — and honest that cutting-edge tooling passed the bank by; he is actively closing that gap with a homelab he will absolutely tell you about.

Left Barclays in the spring redundancy round with a decent package, so no desperation in his search. Slough-based, hybrid fine. Available on two weeks notice. Wants a scale-up where reliability work ships in days, not change-advisory-board quarters. Salary expectation £100k, some flexibility for equity.`,
  },
  {
    n: 11,
    name: "Eleanor Voss",
    email: "eleanor.voss@gmail.com",
    headline:
      "Frontend developer (career changer) — ex-secondary school teacher",
    skills: [
      "JavaScript",
      "React",
      "TypeScript",
      "CSS",
      "Accessibility",
      "Node.js basics",
    ],
    source: "other",
    addedDays: 18,
    cv: `Career changer, eighteen months into software after eight years teaching secondary school physics, including four as head of department. Completed the Founders and Coders bootcamp, then a first dev role at a small edtech where she has just shipped her third production feature — an accessible quiz-builder used by 200 schools, screen-reader tested because she insisted, not because the ticket said so.

The teaching years transfer better than most CVs suggest: she explains technical decisions clearly, takes feedback without bruising, and has run more difficult stakeholder conversations (parents' evenings) than most mid-level engineers. Her code review comments are reportedly the kindest and most precise on the team. Currently deepening TypeScript and testing; honest about the gaps — limited backend exposure, no production incident experience yet.

Based in Sheffield, remote-first essential (two school-age children), occasional travel fine. Four weeks notice. Looking for a mid-junior frontend role at a company that will invest in her for two years and get a decade of loyalty back. Salary expectation modest at £45–50k. One to champion.`,
  },
  {
    n: 12,
    name: "Marcus Bell",
    email: "marcus@bellworks.dev",
    headline:
      "Contract React engineer — fintech specialist, outside IR35 preferred",
    skills: [
      "React",
      "TypeScript",
      "Redux",
      "Next.js",
      "Highcharts",
      "WebSockets",
      "Node.js",
    ],
    source: "other",
    addedDays: 44,
    cv: `Contract frontend engineer, twelve years total, contracting for the last six almost entirely in fintech. Recent engagements: eight months at HSBC building an FX-pricing dashboard (React, WebSockets, sub-second tick updates), a year at a crypto-custody startup rebuilding their onboarding and KYC flows, six months at Starling on internal ops tooling. Day rate £575–625 outside IR35; will consider inside for the right gig or a genuinely interesting perm role at £95k+ — he is contract-first but "convertible", his word.

Delivers fast and documents as he goes; two former clients have brought him back, which is the reference that matters. Deep in the React ecosystem including the unfashionable corners — he can still untangle a legacy Redux-saga codebase without complaint. Limited interest in mobile.

London-based, on-site friendly. Available at two weeks notice as his current engagement winds down. The fintech pattern-matching is genuinely valuable: he has seen five compliance departments' worth of edge cases and designs UI state accordingly. Keeps a tidy portfolio site with case studies clients have approved.`,
  },
  {
    n: 13,
    name: "Ingrid Solheim",
    email: "ingrid.solheim@protonmail.com",
    headline: "Data scientist — ML in production, healthcare analytics",
    skills: [
      "Python",
      "scikit-learn",
      "PyTorch",
      "SQL",
      "MLflow",
      "Causal inference",
      "R",
    ],
    source: "linkedin",
    addedDays: 88,
    archived: true,
    cv: `Data scientist, seven years, ex-Babylon Health where she built triage-prioritisation models under clinical-safety review — real ML governance, not slideware: model cards, drift monitoring, a rollback that actually got exercised. After Babylon wound down she spent a year at a London consultancy doing churn prediction and demand-forecasting work for retail clients — competent, well-reviewed engagements, but she is visibly less engaged when she talks about them, and she named the lack of mission as the reason she came to us in the first place.

Methodologically strong: comfortable saying "a logistic regression beat the transformer and shipped in a week", which is exactly the judgement most teams lack. Publishes occasionally on causal inference in observational health data. MSc Statistics, University of Oslo.

PLACED: we closed her with Helixcare as employee-side data science adjacent to the pipeline role — started successfully, passed probation, hiring manager delighted. Archived from active search; keep the relationship warm, she knows everyone in Nordic health-data circles and has already sent us one referral.`,
  },
  {
    n: 14,
    name: "Oluwaseun Adeyemi",
    email: "seun.adeyemi@yahoo.co.uk",
    headline: "Backend engineer — Java/Kotlin, trading and market-data systems",
    skills: [
      "Java",
      "Kotlin",
      "Kafka",
      "Aeron",
      "PostgreSQL",
      "Low-latency systems",
      "System design",
    ],
    source: "linkedin",
    addedDays: 38,
    cv: `Backend engineer, nine years, currently at LMAX building matching-engine-adjacent services — order-entry gateways and market-data fanout where microseconds are budgeted and every allocation is argued about. Before LMAX: four years at a spread-betting firm working up from graduate to the engineer trusted with the risk-calculation rewrite, delivered without a single production incident during cutover.

Exceptional mechanical sympathy: he reasons about queues, batching and backpressure the way most engineers reason about if-statements, and his system-design thinking is shaped by systems where "eventually consistent" is a firing offence. Wants out of ultra-low-latency, interestingly — the problems have become narrow and he misses product context. Payments or fintech infrastructure would use everything he has while giving him room to breathe.

Nigerian-British, London, no visa considerations. Twelve weeks notice, contractually firm. Comp expectation £90–95k, a genuine pay cut from LMAX bonus years, which tells you the motivation is real. Softly spoken in interviews until the conversation turns technical, then completely different energy. Two competing processes active — move quickly.`,
  },
  {
    n: 15,
    name: "Carys Llewellyn",
    email: "carys.llew@gmail.com",
    headline: "Fullstack TypeScript engineer — Next.js, product-minded",
    skills: [
      "TypeScript",
      "Next.js",
      "React",
      "Node.js",
      "Prisma",
      "PostgreSQL",
      "Vercel",
    ],
    source: "job-board",
    addedDays: 31,
    cv: `Fullstack engineer, five years, currently at a Series B legal-tech startup where she is one of six engineers who built the whole platform: Next.js, tRPC, Prisma, Postgres. She owns the document-automation feature end to end — the revenue driver — including the editor rewrite that took concurrent-editing conflicts from a weekly support fire to a non-issue. Ships fast, tests the parts that matter, and writes PR descriptions good enough to double as documentation.

Previously two years at BBC News on their live-coverage front end, which taught her graceful degradation under real traffic. The startup years taught her everything else: talking to users, scoping ruthlessly, deploying on Fridays without fear because the pipeline earns it.

Cardiff-born, London-based. Her startup's runway is visibly shortening — she is honest that this is why she is looking, and she wants stability without returning to BigCo pace. One month notice. Salary expectation £78–85k. Interviews warmly; her walkthrough of the editor conflict-resolution design is the best portfolio piece we have seen this quarter.`,
  },
  {
    n: 16,
    name: "Viktor Petrov",
    email: "viktor.petrov.eng@gmail.com",
    headline: "Senior backend engineer — event-driven architecture, ex-Wise",
    skills: [
      "Java",
      "Kafka",
      "Event sourcing",
      "PostgreSQL",
      "Kubernetes",
      "System design",
      "Spring Boot",
    ],
    source: "linkedin",
    addedDays: 36,
    cv: `Senior backend engineer, ten years, four of them at Wise on the transfers platform — the event-sourced core that moves customer money across currencies. He led the "transfer state machine" consolidation that collapsed seven overlapping status models into one auditable event log, killing a whole category of customer-support tickets. Bulgarian, in the UK since 2015, settled status.

Architecturally excellent: event-driven design, outbox patterns, schema evolution, the operational realities of Kafka at bank-adjacent scale. His system-design interviews are reliably the strongest part of his process. The flag: he knows it. Two clients have described him as "brilliant, borderline arrogant" — he needs an interviewer senior enough to earn his respect, and a role with genuine architectural authority or he will visibly disengage.

Left Wise in a restructure six months ago, has been selective (his account) since. London, hybrid. Available almost immediately. Wants £100k+ and a principal-track conversation within a year. Submit him to hard problems and strong panels only; he is a poor fit for gentle mid-level loops and it shows quickly.`,
  },
  {
    n: 17,
    name: "Nadia Hussain",
    email: "nadia.hussain.dev@gmail.com",
    headline: "Senior React engineer at a challenger bank — design-system lead",
    skills: [
      "React",
      "TypeScript",
      "Design systems",
      "Next.js",
      "React Native",
      "Accessibility",
      "Figma",
    ],
    source: "referral",
    addedDays: 39,
    cv: `Senior frontend engineer at Starling Bank, five and a half years in fintech overall. She leads Starling's web design system — 70+ components, consumed by six teams — and drove the accessibility programme that took the online banking app to WCAG 2.2 AA with an external audit to prove it. Before Starling: ClearBank, building back-office tooling for payment operations, where she learned what reconciliation actually means before ever styling a screen for it.

Rare combination of systems thinking and craft: she talks about component API design the way backend engineers talk about service contracts, versioning and deprecation policy included. Some React Native exposure from Starling's shared-component experiments. Mentors two juniors formally and is ready to be more than a strong IC — though she wants influence through architecture, not people management.

Referred by an ex-colleague, which is how she prefers to move — she has never applied cold to anything. Leeds-based, two London days fine. Eight weeks notice. Comp needs care: she is on £98k plus a strong bonus and will want £105k+ to move. Worth every conversation; candidates like this surface once a quarter.`,
  },
  {
    n: 18,
    name: "Ben Carmody",
    email: "ben.carmody@outlook.com",
    headline: "SDET — Playwright and CI pipelines, ex-manual QA",
    skills: [
      "Playwright",
      "TypeScript",
      "CI/CD",
      "API testing",
      "k6",
      "Test strategy",
    ],
    source: "job-board",
    addedDays: 55,
    archived: true,
    cv: `Software development engineer in test, six years total: three manual, three automation, which gives him the tester's instinct most pure SDETs never develop. Currently at Moonpig, where he built the Playwright suite that gates every deploy — 1,400 scenarios, flake rate under 0.5%, run time held at eleven minutes through ruthless parallelisation. Also introduced k6 load tests for the card-render pipeline ahead of the Christmas peaks, catching a capacity cliff that would have been a Boxing Day incident.

Writes TypeScript well enough that the line between him and the developers is mostly title. Talks about testing as risk communication rather than bug counting — his test-strategy docs are genuinely good reading. Wants a first "quality lead" scope: strategy across squads rather than one team's pipeline.

ARCHIVED at his request: accepted a counter-offer from Moonpig in July (promotion to principal SDET) and asked us to pause. Parked on friendly terms — he said, credibly, "call me in a year". Do not submit anywhere; note the counter-offer pattern for future comp conversations.`,
  },
  {
    n: 19,
    name: "Lucía Fernández",
    email: "lucia.fdez@icloud.com",
    headline: "Frontend engineer — design systems and creative UI",
    skills: [
      "React",
      "TypeScript",
      "CSS",
      "Framer Motion",
      "Storybook",
      "Figma",
    ],
    source: "linkedin",
    addedDays: 68,
    cv: `Frontend engineer, five years, from Valencia, in London since 2021 with pre-settled status. Currently at a design-led agency (Studio Norte) building marketing sites and product UI for consumer brands — the portfolio is genuinely beautiful: award-shortlisted work for a fashion label, a museum, and a drinks brand, all motion-rich, all performant. Framer Motion and CSS craft at a level most product engineers never reach.

The open question is depth beyond the surface. Agency cadence means she has rarely lived with a codebase longer than four months, and state management beyond component level is thin — she is aware of it and refreshingly honest: "I can make anything feel good; I want to learn to make it scale." Pairing her with a strong technical lead would be transformative in both directions.

Looking for her first product-company role, ideally consumer-facing where craft is valued. Four weeks notice. Salary expectation £60–65k. Interviews with real charm and a portfolio walkthrough that wins rooms — protect her from purely algorithmic screens, where she underperforms her actual ability.`,
  },
  {
    n: 20,
    name: "Peter Osei",
    email: "peter.osei.cloud@gmail.com",
    headline:
      "DevOps engineer — Terraform, AWS, platform migrations; 3 months notice",
    skills: [
      "Terraform",
      "AWS",
      "Kubernetes",
      "Python",
      "GitLab CI",
      "Ansible",
    ],
    source: "job-board",
    addedDays: 64,
    cv: `DevOps engineer, seven years, currently at a large insurer (Aviva) inside a 40-person platform organisation. Solid enterprise credentials: he co-owns the Terraform module library used by 200+ engineers, ran the EKS upgrade programme across three environments, and knows change management in a regulated business inside out. Before Aviva: a media company and an MSP, so he has seen small-shop scrappiness too, even if it was a while ago.

Technically dependable across the standard estate — Terraform, AWS, Kubernetes, GitLab pipelines, Python glue. The honest read from two conversations: he executes established patterns well but is less fluent when asked to design from a blank page, and he leans on vendor terminology where a first-principles answer would land better. Coaching before technical interviews recommended; he is better than his interview performances.

Motivated to leave big-company process behind and get closer to the work. Three months notice, strictly held by Aviva. Croydon-based, hybrid fine. Salary expectation £75k. Steady, loyal profile — the right mid-size company gets a decade out of him.`,
  },
];

const candidatesB: CandidateSeed[] = [
  {
    n: 21,
    name: "Aoife Gallagher",
    email: "aoife.gallagher@gmail.com",
    headline: "Product manager — payments and platform, ex-TrueLayer",
    skills: [
      "Product strategy",
      "Payments",
      "API products",
      "SQL",
      "Roadmapping",
      "Discovery",
    ],
    source: "outreach",
    addedDays: 15,
    cv: `Product manager, seven years, five of them in payments. Three years at TrueLayer on the payments API product — she owned merchant onboarding and the payout release, working directly with engineering on API design, error taxonomies and SLAs, and can talk to a room of engineers in their own vocabulary. Before that: an associate PM programme at PayPal Dublin and a year at a Dublin bank running open-banking compliance projects, which she describes as "learning what regulation feels like from the inside".

Platform instincts over growth instincts: her craft is API products, developer experience and reliability trade-offs, and her discovery work is unusually rigorous — she interviews five customers before writing a line of any PRD. Engineers who have worked with her keep working with her; two followed her between companies.

Dublin-born, London for six years. Currently between roles after TrueLayer's autumn restructure, so available immediately — but she is being choosy and turned down two offers already for being "feature factory" roles. Wants a payments or infrastructure product with genuine technical depth. Salary expectation £90k.`,
  },
  {
    n: 22,
    name: "Jakub Nowak",
    email: "jakub@nowak.consulting",
    headline: "Contract fullstack engineer (TypeScript) — outside IR35 only",
    skills: ["TypeScript", "React", "Node.js", "PostgreSQL", "AWS", "NestJS"],
    source: "other",
    addedDays: 16,
    cv: `Contract fullstack engineer, ten years experience, contracting since 2019 at £500–550/day, outside IR35 only — he is firm on this and structures engagements properly, own limited company, deliverables-based contracts, IR35 insurance in place. Recent work: fourteen months building a claims-management platform for an insurtech (React, NestJS, Postgres), before that a six-month rescue of a failing agency build for a logistics client, delivered in seven.

The rescue work is his signature: he is the contractor you bring into a codebase everyone is scared of. Reads unfamiliar systems fast, stabilises before refactoring, leaves documentation behind. Polish, in the UK twelve years, no visa considerations. Warsaw University of Technology.

Genuinely uninterested in permanent conversion — do not pitch it, two clients have tried and it soured things slightly. Available from the start of next month. Prefers three-plus-month engagements with a concrete brief over open-ended augmentation. Kent-based, will do up to two on-site days. Communicative and blunt in a useful way; clients either love him immediately or take a fortnight to.`,
  },
  {
    n: 23,
    name: "Renata Silva",
    email: "renata.silva.data@gmail.com",
    headline: "Data engineer — healthcare interoperability, FHIR pipelines",
    skills: [
      "Python",
      "FHIR",
      "Airflow",
      "dbt",
      "BigQuery",
      "Kafka",
      "Information governance",
    ],
    source: "referral",
    addedDays: 37,
    cv: `Data engineer, six years, currently at a health-data unit inside a large NHS trust in Manchester where she builds the pipelines that feed clinical dashboards: HL7 and FHIR ingestion, Airflow orchestration, dbt models over BigQuery. She led the flow that unified emergency-department attendance data across three hospital sites — the messy, politically delicate kind of integration where the technical work is half the job — and it now underpins the trust's winter-pressures planning.

Before the NHS: two years at a São Paulo fintech doing more conventional analytics engineering, so she has seen commercial pace and chose healthcare deliberately. Brazilian-Portuguese dual national with settled status. The NHS has trained her superbly in information governance and starved her of modern tooling budget in equal measure — she is candid that she wants NHS-adjacent product work, not another trust role.

MSc Health Informatics, Manchester. One month notice. Salary expectation £85–95k, a big jump from NHS banding and justified by the market. Referred by Ingrid Solheim, which is a meaningful signal — Ingrid does not refer casually.`,
  },
  {
    n: 24,
    name: "Callum McRae",
    email: "callum.mcrae94@gmail.com",
    headline: "Junior frontend developer — career changer, ex-chef",
    skills: [
      "JavaScript",
      "React",
      "HTML/CSS",
      "Git",
      "Node.js basics",
      "TailwindCSS",
    ],
    source: "job-board",
    addedDays: 12,
    cv: `Junior frontend developer, one year in, after nine years as a chef — the last three running a twelve-cover kitchen in Glasgow as sous chef. Self-taught through lockdown, then CodeClan's final cohort before it closed, then a junior role at a small Scottish travel-booking startup where he has spent a year shipping React features: search filters, a booking-summary redesign, and a surprising amount of date-handling logic he can discuss in painful detail.

The kitchen background is not a novelty line — it is the whole pitch. He works clean, communicates under pressure, takes correction without ego, and has never missed a deadline in his life because in his old job a missed deadline was a ruined service. His code is careful rather than clever, which is exactly right for his level, and his commit hygiene would embarrass most seniors.

Startup is wobbling (founder conflict), hence the search. Glasgow-based, remote or hybrid, will not relocate. Available on two weeks notice. Salary expectation £35–40k. Best junior interview of the month — give him a take-home over a live algorithm round and he will convert.`,
  },
  {
    n: 25,
    name: "Yuki Tanaka",
    email: "yuki.tanaka.dev@proton.me",
    headline:
      "Backend engineer — Python/Django, marketplace platforms; needs sponsorship",
    skills: [
      "Python",
      "Django",
      "PostgreSQL",
      "Celery",
      "Redis",
      "Docker",
      "GraphQL",
    ],
    source: "linkedin",
    addedDays: 50,
    cv: `Backend engineer, six years, currently at Mercari in Tokyo on the marketplace-listings platform: Django services handling listing creation, search indexing feeds and the fraud-screening queue, at a scale of several million listings a week. Led the Celery-to-managed-queue migration that cut task latency incidents to near zero and wrote the internal playbook for zero-downtime Django migrations that other teams adopted.

Strong, conscientious engineer with excellent written English (documentation is a visible strength) and good spoken English that improves noticeably as calls warm up. Relational modelling is solid at marketplace scale; distributed-systems exposure is narrower — Mercari's platform team abstracts much of it away, and he is honest about wanting to close that gap.

Relocating to the UK for his partner's academic post starting January. Needs Skilled Worker sponsorship; timeline works for a January or February start and he has legal advice already arranged. Interviewing across time zones is fine with notice. Salary expectation £70–78k, researched and realistic. Patient, methodical, will need a structured onboarding rather than sink-or-swim.`,
  },
  {
    n: 26,
    name: "Grace Adeola",
    email: "grace.adeola@outlook.com",
    headline: "Frontend engineer — accessibility specialist, React",
    skills: [
      "React",
      "TypeScript",
      "Accessibility",
      "WCAG",
      "Testing Library",
      "CSS",
      "Screen readers",
    ],
    source: "referral",
    addedDays: 29,
    cv: `Frontend engineer, five years, currently at the Government Digital Service working on GOV.UK services used by millions — where accessibility is a legal floor, not a nice-to-have. She has personally remediated three services to WCAG 2.2 AA, runs assistive-technology testing sessions (real screen-reader users, not simulators), and contributes to the GOV.UK Design System's form components. Her React is production-solid; her accessibility depth is the differentiator — genuinely rare in the market.

Before GDS: an agency building council websites, which she describes as "accessibility theatre" and left on principle when audits kept getting waived. That principle runs through her profile — she will ask hard questions in interviews about whether a company's public accessibility commitments are resourced or decorative.

Ready to leave the civil service for product work; pay is the honest driver alongside pace. South London, hybrid. One month notice. Salary expectation £70–75k, a significant jump from her civil-service band but under market for her specialism. Any consumer brand with a public WCAG commitment should fight for her.`,
  },
  {
    n: 27,
    name: "Stefan Weber",
    email: "stefan.weber@fastmail.de",
    headline: "Staff engineer — developer platforms, ex-Zalando",
    skills: [
      "Kubernetes",
      "Go",
      "Java",
      "Platform engineering",
      "AWS",
      "System design",
      "Developer experience",
    ],
    source: "linkedin",
    addedDays: 30,
    cv: `Staff engineer, twelve years, until recently at Zalando in Berlin where he spent five years in platform engineering — latterly leading the internal developer-platform team whose build-and-deploy tooling served 2,000+ engineers. He drove the golden-path initiative that cut median service-bootstrap time from three days to forty minutes, and the multi-cluster Kubernetes federation work underneath it. Thinks in systems by default: control plane versus data plane, blast-radius budgets, paved roads with well-lit escape hatches.

German, relocated to London in the summer for family reasons; full right to work (pre-settled status via earlier UK years). This is the rare staff-level candidate actively seeking smaller scale — he wants to be the first platform hire somewhere and build the thing rather than govern it. Interviews thoughtfully and without ego; his answer to a question he does not know is "I don't know, here is how I would find out", delivered without flinching.

Available now. Comp expectation £125–135k but explicitly flexible against equity and scope. Shortlist him anywhere the platform is the product's foundation.`,
  },
  {
    n: 28,
    name: "Isla Morrison",
    email: "isla.morrison@hey.com",
    headline: "Fullstack engineer — early-stage generalist, 0-to-1 specialist",
    skills: [
      "TypeScript",
      "React",
      "Node.js",
      "PostgreSQL",
      "AWS",
      "Product discovery",
    ],
    source: "outreach",
    addedDays: 23,
    cv: `Fullstack engineer, six years, all of it at early-stage startups — engineer number three at a proptech that reached Series A, then two years as the first hire at a creator-economy startup that failed honestly, then eighteen months at her current climate-reporting startup where she built the MVP that closed their seed round. She has personally stood up auth, billing, analytics, CI and a design system from nothing at least three times and has strong, tested opinions about what to buy versus build at each stage.

The generalist trade-off is real and she names it herself: breadth over depth, architecture instincts from experience rather than scale. What she brings is judgement under ambiguity — she has watched startups die of premature platform work and of technical debt alike, and she can tell you which smell is which.

Edinburgh-based, remote-first non-negotiable (the current role is fully distributed). Two weeks notice. Wants a mid-size startup this time — "someone else's turn to set up billing" — with product ownership intact. Salary expectation £75k. Energising on calls; founders consistently love her.`,
  },
  {
    n: 29,
    name: "Dmitri Ivanov",
    email: "dmitri.ivanov.sre@gmail.com",
    headline: "Site reliability engineer — observability and incident tooling",
    skills: [
      "Prometheus",
      "Grafana",
      "OpenTelemetry",
      "Kubernetes",
      "Go",
      "Terraform",
      "PagerDuty",
    ],
    source: "job-board",
    addedDays: 66,
    cv: `SRE, seven years, currently at Skyscanner on the observability platform team: he owns the OpenTelemetry rollout across 300 services, the Prometheus long-term storage estate, and the internal "you build it, you watch it" tooling that turned dashboard sprawl into curated golden signals. Prior roles at a betting company (high-cardinality metrics pain, learned the hard way) and a hosting provider in Sofia.

He is the engineer other teams call when their p99 graph makes no sense, and he enjoys that role visibly. Strong Go for tooling; honest that he is an observability specialist first and a generalist SRE second — capacity planning and Kubernetes internals are solid, databases less so. Wrote a well-regarded conference talk on alert fatigue ("Your on-call hates you and here is the graph that proves it").

Bulgarian, settled status, Edinburgh-based, remote-friendly roles only — he visits a London office monthly at most. One month notice. Salary expectation £90–95k. Considered and unflappable on calls; his incident walkthroughs are textbook.`,
  },
  {
    n: 30,
    name: "Fatima Zahra El Idrissi",
    email: "fz.elidrissi@gmail.com",
    headline:
      "Data scientist — NLP and search relevance; visa sponsorship needed",
    skills: [
      "Python",
      "PyTorch",
      "NLP",
      "Elasticsearch",
      "SQL",
      "MLOps",
      "Transformers",
    ],
    source: "linkedin",
    addedDays: 11,
    cv: `Data scientist, five years, currently at Jumia in Casablanca working on search relevance and product categorisation for one of Africa's largest e-commerce platforms: multilingual NLP (Arabic, French, English) over noisy marketplace text, embedding-based retrieval that lifted search conversion 8%, and the classifier pipeline that auto-categorises 200k new listings a week. She ships models to production herself — feature pipelines, monitoring, rollback — rather than handing notebooks over a wall.

MSc in Machine Learning from Mohammed VI Polytechnic, thesis on low-resource language modelling, one workshop paper. Sharp, direct, and impressively current — her answers reference what she has deployed, not what she has read.

Seeking UK relocation; needs Skilled Worker sponsorship and is aware that narrows the field — she is targeting companies where the multilingual search experience is a differentiator and her edge is obvious. Available with roughly eight weeks lead time for visa processing. Salary expectation £65–75k, flexible. A strong bet for any marketplace or content platform willing to sponsor; her ceiling is high.`,
  },
  {
    n: 31,
    name: "Ollie Hart",
    email: "ollie.hart@icloud.com",
    headline: "React / React Native engineer — consumer fintech apps",
    skills: [
      "React",
      "React Native",
      "TypeScript",
      "Expo",
      "Redux Toolkit",
      "Detox",
    ],
    source: "job-board",
    addedDays: 12,
    cv: `Frontend engineer, five years, currently at Plum (the savings app) working across React Native and the React web app: he shipped the round-ups redesign, the in-app investment onboarding flow (his proudest work — compliance-heavy, four regulator-driven revisions, still converts well), and maintains the shared component layer between mobile and web. Before Plum: two years at a sports-media startup doing pure web React.

The fintech app experience is current and genuinely product-shaped — he talks about drop-off curves and KYC friction like a PM, then implements like an engineer. Mobile-first by recent habit but explicitly wants to keep a foot in web; a web-leaning role with occasional React Native would be his ideal shape.

Brighton-based, one London day a week is fine. One month notice. Salary expectation £72–78k. Young-ish profile with momentum: two promotions in three years, an internal hackathon win that became a real feature, and the kind of enthusiasm on calls that panels remember afterwards. Watch-out: he interviews slightly nervously in the first ten minutes, then settles into genuine quality.`,
  },
  {
    n: 32,
    name: "Kirsten Vogel",
    email: "kirsten.vogel@posteo.de",
    headline: "Engineering lead — scaling teams through migrations, ex-Babbel",
    skills: [
      "Engineering management",
      "TypeScript",
      "Ruby",
      "Team topologies",
      "Hiring",
      "Architecture reviews",
    ],
    source: "outreach",
    addedDays: 30,
    cv: `Engineering lead, thirteen years total, six in management. At Babbel in Berlin she grew the learning-experience group from one squad to three (sixteen engineers), ran the strangler-pattern migration off the legacy Rails monolith while shipping quarterly product goals, and kept regretted attrition at zero for two years — a stat she raises with evidence, not as a slogan. Still technical enough to review architecture proposals credibly; last wrote production code eighteen months ago and is comfortable saying so.

Management philosophy is structured and humane: written expectations, real career frameworks, decisive underperformance conversations. Two of her former engineers described her, independently, as the best manager they have had. Moved to London this year (spouse's role); full right to work.

Wants a lead role over two squads with a meaty technical transition to steer — migrations are genuinely her element. Less suited to pure greenfield or pure firefighting. Available on six weeks notice (contractual courtesy to a consulting engagement). Comp expectation £115–120k. Panels should include her future reports; she reads a team's health fast and both sides learn from it.`,
  },
  {
    n: 33,
    name: "Sam Njoroge",
    email: "sam.njoroge@gmail.com",
    headline: "Backend engineer — Node.js, marketplace and logistics platforms",
    skills: [
      "Node.js",
      "TypeScript",
      "PostgreSQL",
      "Redis",
      "RabbitMQ",
      "AWS",
      "Microservices",
    ],
    source: "linkedin",
    addedDays: 52,
    cv: `Backend engineer, six years, currently at Deliveroo on the restaurants platform: menu ingestion, availability sync, and the order-routing edge cases that appear when 100 restaurants go offline in a storm. He built the menu-validation service that cut partner-onboarding failures by a third, and co-owns an event pipeline pushing several thousand messages a second at dinner peak. Earlier: three years at Twiga Foods in Nairobi building agricultural-supply-chain APIs — real logistics, patchy connectivity, offline-first constraints most London engineers have never faced.

Practical, delivery-focused profile: strong Node and Postgres, sensible service boundaries, allergic to overengineering ("Twiga taught me every abstraction has a diesel cost"). Distributed-systems theory is working-level rather than deep — he is a builder more than an architect and content being so for now.

Kenyan-British dual national, London, no visa considerations. One month notice. Actively interviewing and honest about it — he is in two other processes, both marketplace companies. Salary expectation £85k. Moves fast, communicates fast; a good closer's candidate.`,
  },
  {
    n: 34,
    name: "Beatriz Costa",
    email: "bia.costa.qa@gmail.com",
    headline: "QA automation engineer — Cypress/Playwright, fintech testing",
    skills: [
      "Playwright",
      "Cypress",
      "TypeScript",
      "API testing",
      "CI/CD",
      "Test strategy",
    ],
    source: "job-board",
    addedDays: 70,
    archived: true,
    cv: `QA automation engineer, five years, most recently at a Lisbon-headquartered payments company (in their London office) testing card-issuing flows: Playwright suites over the merchant dashboard, contract tests against the issuing API, and the synthetic-transaction monitors that caught a settlement bug pre-release which would have misposted five figures a day. Meticulous, calm, well-liked — her bug reports read like small forensic essays.

Portuguese, settled status, South London. Strong on test design and automation craft; less interested in performance testing or leading a function — she wants to stay hands-on at senior level rather than manage.

ARCHIVED: withdrew from the market in July — she and her partner are relocating to Porto for family reasons and she has accepted a remote role with a Portuguese bank. Asked us warmly to keep her details for UK-remote openings in a year or two. No submissions meanwhile. Left every process she was in gracefully, with apologies to two clients — the kind of exit that makes you want to work with someone again.`,
  },
  {
    n: 35,
    name: "Arjun Mehta",
    email: "arjun.mehta.dev@gmail.com",
    headline: "Senior React engineer — trading UIs and real-time data",
    skills: [
      "React",
      "TypeScript",
      "WebSockets",
      "D3",
      "AG Grid",
      "Node.js",
      "Performance profiling",
    ],
    source: "outreach",
    addedDays: 29,
    cv: `Senior frontend engineer, eight years, currently at IG Group building trading interfaces: real-time price grids (AG Grid pushed far beyond its comfort zone), charting built on D3, and order tickets where a rendering hiccup is a P1. He led the workstream that moved the platform's data layer to a shared WebSocket multiplexer, cutting connection overhead 70% and taming a class of stale-price bugs that had haunted support for years. Profiling is second nature — he talks in flame graphs.

Before IG: a Mumbai fintech building broker dashboards, then an MSc at Imperial. The consistent thread is high-stakes UI over streaming data, and he wants to keep it: his stated ideal is "anywhere the interface is the product and the data never sits still".

British citizen, London, four weeks notice. Comp expectation £95–100k. Two flags, both mild: he is deeply specialised (a content-site role would bore him within a quarter), and he prefers deep work over meetings to a degree that needs the right team shape. Technically, among the strongest React profiles on our books.`,
  },
  {
    n: 36,
    name: "Charlotte Dunn",
    email: "charlotte.dunn.pm@outlook.com",
    headline: "Senior product manager — B2B SaaS, analytics products",
    skills: [
      "B2B SaaS",
      "Product analytics",
      "SQL",
      "Pricing",
      "Customer discovery",
      "Roadmapping",
    ],
    source: "linkedin",
    addedDays: 26,
    cv: `Senior PM, eight years, currently at GoCardless on the merchant-dashboard product — reporting, reconciliation views and the self-serve analytics that keep mid-market customers from churning to enterprise competitors. She ran the pricing-page and packaging revamp with commercial teams (a 6% net revenue lift she is careful to co-credit), and her customer-discovery practice is disciplined: forty-plus recorded interviews a year, synthesised properly.

Earlier: three years at Geckoboard, where she learned small-company scrappiness, and a strategy-consulting start she rarely mentions. B2B is her clear strength — she understands buyer-versus-user dynamics deeply. Consumer growth mechanics are the known gap, and she says so herself before you can ask.

Motivated by scope: GoCardless is consolidating product lines and her remit is shrinking. Wants a senior or lead PM role owning a revenue-adjacent product end to end. St Albans-based, three London days is fine. Two months notice. Salary expectation £92–98k. Polished interviewer — crisp narratives, receipts on request. The e-commerce growth brief would stretch her stated comfort zone; worth an honest conversation before submitting.`,
  },
  {
    n: 37,
    name: "Emil Lindqvist",
    email: "emil.lindqvist@proton.me",
    headline:
      "Senior infrastructure engineer — Go and Rust, high-throughput systems",
    skills: [
      "Go",
      "Rust",
      "Kafka",
      "Kubernetes",
      "gRPC",
      "System design",
      "Performance engineering",
    ],
    source: "linkedin",
    addedDays: 35,
    cv: `Senior backend/infrastructure engineer, nine years, currently at Klarna Stockholm (remote from Leeds for the past two years) on the checkout-infrastructure team: the Go services that sit in the hot path of every purchase, where his latency work — connection pooling redesign, request hedging, one legendary week hunting a 99.9th-percentile GC pause — bought back 40ms at p99 across the fleet. Increasing amounts of Rust for the newest data-plane components, and he is good enough at it to be opinionated about when not to use it.

System-design depth is real and battle-earned: cell-based architecture, load shedding, graceful brownout. He gives the best incident narratives we have heard this year, including one where the fix was organisational rather than technical, which he identifies as the point.

Swedish, settled status, Leeds, remote-first strongly preferred with monthly travel fine. Two months notice. Comp expectation £110–120k — top of most bands, and he knows it; he will trade a little for genuinely hard problems and has said so explicitly. Two other processes live, one at final stage. Priority candidate: move fast or lose him.`,
  },
  {
    n: 38,
    name: "Roisin Byrne",
    email: "roisin.byrne@gmail.com",
    headline: "Frontend engineer — Vue-to-React convert, e-commerce",
    skills: ["React", "Vue", "TypeScript", "Nuxt", "Next.js", "CSS", "Shopify"],
    source: "job-board",
    addedDays: 32,
    cv: `Frontend engineer, five years: three in Vue at an Irish travel-booking company (Nuxt storefront, 2m sessions a month), then two in React at THG in Manchester on beauty-brand storefronts. The framework switch is her quiet superpower — she learned React properly rather than writing Vue in React syntax, and she articulates the differences (reactivity models, rendering behaviour, ecosystem trade-offs) better than most engineers who only know one. Component architecture and CSS craft are both genuinely strong; she has shipped through four peak trading seasons without a conversion-impacting incident.

THG is THG — she is direct that the environment has worn her down and she wants a smaller, kinder team where the storefront is loved rather than churned. Reads as steady and slightly understated on first call; her portfolio and code samples oversell her relative to her self-presentation, which is the right way round.

Irish citizen, Manchester-based, hybrid or remote. Four weeks notice. Salary expectation £62–68k. A strong, low-risk mid-senior hire for any e-commerce brand; she converts offers when teams feel human.`,
  },
  {
    n: 39,
    name: "Kwame Mensah",
    email: "kwame.mensah.data@gmail.com",
    headline: "Data engineer — streaming platforms, Kafka/Flink at scale",
    skills: [
      "Kafka",
      "Flink",
      "Scala",
      "Python",
      "Iceberg",
      "AWS",
      "Data architecture",
    ],
    source: "referral",
    addedDays: 24,
    cv: `Data engineer, eight years, currently at Just Eat Takeaway on the streaming platform team: Kafka at nation-of-hungry-people scale, Flink jobs powering courier ETAs and restaurant demand forecasts, and the migration he led from batch-hourly to sub-minute freshness for the operational dashboards every city team stares at all evening. He designed the platform's exactly-once delivery-semantics layer and the schema-registry governance that stopped teams breaking each other weekly — architecture work, not just pipeline plumbing.

Earlier: BT (batch warehousing, his "penance years", his phrase) and an MSc at Bristol. Scala and Python both production-grade; recently deep in Iceberg table formats for the lakehouse convergence everyone is doing.

British-Ghanaian, London, one month notice. Referred by James O'Donnell — they ran a reading group together, and James rates him "the best data-infrastructure thinker I know", which from James means something. Wants a role where streaming is core to the product, not a reporting afterthought. Salary expectation £95–100k. Thoughtful, unhurried interview presence; give panels his systems questions time to land.`,
  },
  {
    n: 40,
    name: "Alice Thornton",
    email: "alice.thornton.data@outlook.com",
    headline:
      "Data engineer (career changer) — former ICU nurse, healthcare data",
    skills: [
      "Python",
      "SQL",
      "dbt",
      "Airflow",
      "Snowflake",
      "Healthcare data",
      "Power BI",
    ],
    source: "other",
    addedDays: 38,
    cv: `Career changer with a profile you cannot train: eleven years as an ICU nurse (Leeds Teaching Hospitals, latterly a sister running a nine-bed unit), then a deliberate three-year transition — OU maths modules on night shifts, a data-analyst role in the trust's informatics team, and for the last two years a data-engineer position at an NHS-adjacent analytics provider building patient-flow pipelines in Python, dbt and Snowflake.

Her technical level is honest mid: competent pipeline work, good SQL, growing Airflow experience, no streaming exposure yet. What she has that nobody else on this list does is clinical fluency — she has been the end user of every dashboard she now feeds, she knows exactly which data-quality failures kill trust on a ward, and clinicians talk to her like a colleague because she is one. In healthtech, that halves a team's discovery time.

Leeds-based, remote-heavy preferred, school hours matter. Four weeks notice. Salary expectation £60–65k. Interviews with quiet authority; the panel that asks about a time things went wrong will get an ICU story that recalibrates their definition of production pressure.`,
  },
];

const candidatesC: CandidateSeed[] = [
  {
    n: 41,
    name: "Mateusz Kaminski",
    email: "mateusz@kaminski.cloud",
    headline: "Contract DevOps engineer — AWS/Terraform, migration specialist",
    skills: [
      "AWS",
      "Terraform",
      "Kubernetes",
      "GitHub Actions",
      "Python",
      "Datadog",
    ],
    source: "other",
    addedDays: 49,
    cv: `Contract DevOps engineer, eleven years, contracting for five at £550/day. Speciality is cloud migrations with a deadline attached: his last three engagements were a datacentre exit for a retail group (nine months, forty-odd applications moved, finished before the colo contract lapsed), a cost-optimisation gig that cut a scale-up's AWS bill 38% in a quarter, and a CI overhaul for a gaming studio. He arrives with his own Terraform module library, runbooks and estimating spreadsheet, and clients consistently mention how quickly he produces a credible plan.

Blunt Yorkshire-Polish manner — zero politics, allergic to meetings without agendas, delivers what he quotes. The trade-off: he is a poor culture-add for teams wanting a long-term embedded engineer who mentors juniors; that is simply not the product he sells.

Sheffield-based, remote with site visits. Inside or outside IR35 depending on the engagement, priced accordingly. Available in three weeks. Keep him for clearly-scoped migration and platform-hardening work; in that lane he is as reliable as contractors get.`,
  },
  {
    n: 42,
    name: "Leila Haddad",
    email: "leila.haddad.eng@gmail.com",
    headline: "Fullstack engineer — payments integrations, Node and React",
    skills: [
      "Node.js",
      "React",
      "TypeScript",
      "Stripe",
      "Open Banking APIs",
      "PostgreSQL",
      "Webhooks",
    ],
    source: "linkedin",
    addedDays: 20,
    cv: `Fullstack engineer, six years, currently at a mid-size SaaS (invoicing software for accountants) where she owns payments end to end: Stripe billing for the SaaS itself, plus the client-facing payment-collection features built on Open Banking APIs — TrueLayer integration, mandate flows, reconciliation screens. She has debugged enough webhook-delivery horrors to have written the company's now-canonical "webhooks are a distributed-systems problem" doc, and her integration test harness for PSP sandboxes cut release regressions to nearly nothing.

Front end is competent React rather than a passion; her energy is clearly in the API and money-movement layer, and her ideal next role tilts backend-payments while keeping some UI ownership. Steady four-year and two-year stints; leaves things better documented than she found them.

British-Lebanese, Bristol-based, one to two London days fine. One month notice. Salary expectation £75–82k. Quietly impressive on calls — she answers the question asked, then stops, which panels notice and appreciate. A natural fit anywhere payments is becoming the product.`,
  },
  {
    n: 43,
    name: "George Papadopoulos",
    email: "george.papadopoulos@hey.com",
    headline: "Senior backend engineer — Java, high-throughput event systems",
    skills: [
      "Java",
      "Spring Boot",
      "Kafka",
      "PostgreSQL",
      "Kubernetes",
      "System design",
      "JVM tuning",
    ],
    source: "job-board",
    addedDays: 31,
    cv: `Senior backend engineer, nine years, currently at Booking.com Amsterdam (remote from London since 2023) on the availability platform — the read path that answers hundreds of thousands of pricing-and-availability queries a second. He led the cache-topology redesign that survived the last two summer peaks without the annual war room, and his partition-rebalancing work on their Kafka estate is the kind of unglamorous engineering that saves millions quietly. JVM tuning depth that borders on the archaeological.

System-design reasoning is top-decile: he thinks in load numbers, failure domains and cost envelopes without prompting, and he communicates it plainly rather than showing off. Greek, in the UK on a settled-status footing, actively looking because Booking is recentralising roles to Amsterdam and he will not relocate.

Wants high-throughput problems with product visibility — payments, energy telemetry and logistics all interest him, stated in that order. One month notice. Comp expectation £100–110k. Interviewing elsewhere but early-stage; a decisive client could have him wrapped in three weeks.`,
  },
  {
    n: 44,
    name: "Chloe Bevan",
    email: "chloe.bevan01@gmail.com",
    headline: "Junior fullstack engineer — apprenticeship-trained, TypeScript",
    skills: ["TypeScript", "Node.js", "React", "PostgreSQL", "Express", "Jest"],
    source: "referral",
    addedDays: 84,
    archived: true,
    cv: `Junior fullstack engineer, two years post-apprenticeship. Came through the Made Tech software apprenticeship — chosen over university, a decision she defends articulately — then eighteen months on their public-sector delivery teams: a licensing service for a government department (Node, Postgres, GDS patterns) and a data-submission portal for schools. Disciplined engineering habits unusually early: TDD because her mentors insisted until it stuck, small commits, honest estimates.

Sharp trajectory: she went from supervised tickets to independently delivering a minor service feature, including its infrastructure, inside her first year. Backend-leaning by preference, React competent. Welsh, Newport-based, remote-first.

PLACED: Brickrow took her for the backend engineer role after she outperformed two mid-level candidates in the practical exercise — Owen called her "the most coachable engineer I've interviewed". Started successfully; ninety-day check-in glowing on both sides. Archived as a successful placement. Fee invoiced and paid. Keep in touch: she will be a senior worth re-placing in three years, and she has already mentioned two apprentice friends job-hunting next spring.`,
  },
  {
    n: 45,
    name: "Henrik Dahl",
    email: "henrik.dahl@fastmail.com",
    headline: "Senior frontend engineer — web performance specialist",
    skills: [
      "React",
      "TypeScript",
      "Web Vitals",
      "Service Workers",
      "Webpack",
      "Lighthouse CI",
      "Edge rendering",
    ],
    source: "outreach",
    addedDays: 17,
    cv: `Senior frontend engineer, ten years, currently at the Financial Times on the core web-platform team — the group that keeps FT.com fast on terrible conference wifi for subscribers who notice. He owns the performance budget tooling (Lighthouse CI gates every merge), led the edge-rendering migration that halved time-to-headline on article pages, and maintains the service-worker offline layer that quietly serves readers on planes. Speaks and writes about performance publicly; his "the spinner is a lie" talk did the rounds last year.

Danish, in London twelve years, dual citizenship. Methodical to a fault — he will ask for the performance data before agreeing a feature is finished, which most teams need and a few resent. Wants a product where speed is commercially existential rather than culturally nice: commerce checkout or fintech dashboards both qualify and he knows it.

One month notice. Salary expectation £90–95k. Low-drama, high-craft profile; his references describe the same person he presents, which is rarer than it should be.`,
  },
  {
    n: 46,
    name: "Zainab Bello",
    email: "zainab.bello.pm@gmail.com",
    headline: "Technical product manager — developer tools and APIs",
    skills: [
      "Developer tools",
      "API design",
      "Product analytics",
      "Go (reading)",
      "Docs strategy",
      "B2D go-to-market",
    ],
    source: "linkedin",
    addedDays: 12,
    cv: `Technical PM, six years, currently at Snyk on the CLI and IDE-integrations product — developer-facing surface area where the user reads your error messages more often than your marketing site. She owns the CLI roadmap, ran the output-format overhaul that cut support tickets 25%, and reviews API designs alongside staff engineers as a peer rather than a note-taker. Reads Go well enough to check the CLI source before writing a PRD, which engineers mention unprompted and appreciatively.

Before Snyk: a developer-education startup (content and product hybrid role) and a CS degree from Warwick — she chose PM over engineering deliberately and has never been precious about the boundary. Weakness she names herself: enterprise sales-cycle politics drain her, and a heavily sales-led org would be a poor home.

British-Nigerian, London, hybrid. Six weeks notice. Wants a dev-tools or infrastructure product with genuine developer love to build on. Salary expectation £95k. Credible, warm, fluent — the rare PM both engineers and founders trust on first meeting.`,
  },
  {
    n: 47,
    name: "Ravi Shankar",
    email: "ravi.shankar.sre@gmail.com",
    headline: "Platform/SRE engineer — ex-Revolut, reliability at fintech pace",
    skills: [
      "Kubernetes",
      "GCP",
      "Terraform",
      "Go",
      "Prometheus",
      "Incident management",
      "FinOps",
    ],
    source: "linkedin",
    addedDays: 41,
    cv: `Platform engineer, eight years, three of them at Revolut during the hypergrowth years — the reliability team for the payments-processing estate, where "peak" meant Black Friday card volumes and the tolerance for downtime was regulator-shaped. He built the automated failover runbooks that turned a class of regional incidents into non-events, and co-ran the FinOps push that flattened a cloud bill growing faster than transaction volume. Since Revolut: eighteen months at a calmer B2B SaaS, which he describes with faint boredom.

The fintech reliability experience is the asset: he has operated under real regulatory scrutiny, knows what an audit-ready change process feels like when it works, and still moved fast inside it. Go for tooling, deep GCP, strong Kubernetes.

Indian-British, London, hybrid preferred. One month notice. Salary expectation £105k. The honest flag from references: he runs hot in incidents — effective but intense — and has been working on it deliberately; pair him with a calm counterpart and the combination is excellent. Ready for staff-adjacent scope.`,
  },
  {
    n: 48,
    name: "Molly Fitzgerald",
    email: "molly.fitz.dev@icloud.com",
    headline: "Frontend engineer — motion, interaction and brand-heavy UI",
    skills: [
      "React",
      "TypeScript",
      "Framer Motion",
      "GSAP",
      "Three.js",
      "CSS",
      "Design collaboration",
    ],
    source: "job-board",
    addedDays: 14,
    cv: `Frontend engineer, four years, currently at a brand-experience studio in Dublin building the flashy end of the web: product-launch microsites, an award-winning interactive annual report, WebGL flourishes via Three.js where they earn their bytes. Motion is her craft — Framer Motion and GSAP fluency, but more importantly the judgement about when animation communicates and when it decorates, which she can articulate precisely because she started as a design student before switching to engineering.

Shipping discipline is better than the portfolio-kid stereotype: her studio work hits Core Web Vitals budgets because she treats performance as part of the craft, not its enemy. Product-company experience is the gap — long-lived codebases, tests beyond smoke level, roadmap pacing — and it is exactly what she is shopping for.

Irish, relocating to Manchester next month (partner's job), fully flexible on hybrid. Available on three weeks notice. Salary expectation £55–60k. Any consumer brand that wants its storefront to feel alive should meet her; pair her with a systems-minded senior and both flourish.`,
  },
  {
    n: 49,
    name: "Anders Holm",
    email: "anders.holm@protonmail.com",
    headline: "Data scientist — experimentation and causal inference",
    skills: [
      "Python",
      "R",
      "Experimentation",
      "Causal inference",
      "SQL",
      "Bayesian statistics",
      "dbt",
    ],
    source: "linkedin",
    addedDays: 56,
    cv: `Data scientist, seven years, currently at Depop on the experimentation platform: he owns the stats engine behind their A/B testing (CUPED variance reduction, sequential testing guardrails) and consults across product teams as the "is this result real" person. Before Depop: three years at a Copenhagen consultancy doing marketing-mix modelling for FMCG brands, which he credits for his scepticism about attribution claims of every kind.

Methodologically rigorous and communicates uncertainty honestly — his experiment reviews have killed more launches than they have blessed, which he considers the job working as intended. Coding is production-adjacent rather than engineering-grade: solid Python and SQL, no interest in owning pipelines. Machine learning breadth is deliberately narrow; he is an inference specialist and says so.

Danish, settled status, London. Two months notice. Motivated by teams where experiments actually change decisions rather than decorate them — he probes for this hard in interviews, and one hiring manager found it confronting. Salary expectation £88–92k. Best matched to product-led companies with real traffic volumes.`,
  },
  {
    n: 50,
    name: "Tunde Bakare",
    email: "tunde.bakare.dev@outlook.com",
    headline:
      "Fullstack engineer — .NET-to-TypeScript convert, insurance background",
    skills: [
      "TypeScript",
      "Node.js",
      "React",
      "C#",
      ".NET",
      "SQL Server",
      "PostgreSQL",
    ],
    source: "job-board",
    addedDays: 90,
    archived: true,
    cv: `Fullstack engineer, nine years: seven in C#/.NET at two insurers (policy-administration systems, claims workflows, the enterprise stack done properly), then a deliberate two-year retooling into TypeScript — evening projects first, then a Node/React role at a small MGA startup where he rebuilt their broker-quoting portal solo. The enterprise years show in the good way: he documents, he thinks about data integrity, he asks about support rotas before shipping.

His conversion story is credible because it is finished, not aspirational — the recent production work is genuinely TypeScript end to end, with C# now his second language rather than his identity.

PLACED: Nimbus Media hired him for the fullstack engineer role — Elliot specifically liked that he had "boring-systems discipline plus startup recency". Passed probation last month; hiring manager reports he steadied a wobbly billing integration in his first six weeks. Archived as a successful placement, fee paid. Note for the file: he mentioned Nimbus may open two more engineering roles after the rights renewal — follow up with Elliot in November.`,
  },
  {
    n: 51,
    name: "Katya Morozova",
    email: "katya.morozova@gmail.com",
    headline:
      "Frontend engineer — React, strong CS fundamentals; needs sponsorship",
    skills: [
      "React",
      "TypeScript",
      "Algorithms",
      "GraphQL",
      "Apollo",
      "CSS-in-JS",
    ],
    source: "job-board",
    addedDays: 61,
    cv: `Frontend engineer, five years, currently at Yandex-adjacent spinout now headquartered in Belgrade, working on a maps-heavy consumer product: React over a canvas rendering layer, custom virtualisation for enormous result lists, GraphQL data layer. Computer science fundamentals are exceptional — ICPC semi-finalist at university, and it shows in how she reasons about complexity and memory. Her virtualised-list work handles hundreds of thousands of items with a smoothness most engineers assume needs native code.

The interview picture is uneven and worth naming honestly: outstanding on algorithms and focused technical problems, but she can freeze when questions are open-ended or performance is discussed in product terms rather than big-O terms, and her spoken-English confidence dips under pressure (it is fine socially). Structured interviews serve her far better than conversational ones.

Russian citizen, currently in Serbia, needs UK Skilled Worker sponsorship with a realistic three-month lead. Salary expectation £70–75k. High ceiling for a company with the patience for the visa and the interview format that lets her actual ability show.`,
  },
  {
    n: 52,
    name: "Rhys Edwards",
    email: "rhys.edwards.dev@gmail.com",
    headline: "Fullstack engineer — Laravel veteran retooling into TypeScript",
    skills: [
      "PHP",
      "Laravel",
      "TypeScript",
      "React",
      "Node.js",
      "MySQL",
      "PostgreSQL",
    ],
    source: "job-board",
    addedDays: 36,
    cv: `Fullstack engineer, eight years, seven of them in PHP/Laravel at a Cardiff digital agency — latterly as their most senior engineer, running builds for membership organisations and a sizeable e-learning platform (400k users, his architecture, still running well). For the last eighteen months he has been deliberately migrating his stack to TypeScript: a Next.js side project with real paying users (a rugby-club management tool, 60 clubs), Node services at work where he can smuggle them in, and a disciplined study habit he can evidence.

The agency-senior profile brings underrated strengths: client-facing communication, estimating, mentoring two juniors, and shipping within budgets. The gap is honest — his production TypeScript is lighter than his production PHP, and some teams will price him as mid on the new stack despite senior-level judgement. The right hire treats that as an arbitrage.

Welsh, Cardiff, remote-heavy preferred. Four weeks notice. Salary expectation £60–68k, pragmatic about the stack-switch discount. Loyal profile — one employer for seven years — and interviews as exactly what he is: solid, honest, ready.`,
  },
  {
    n: 53,
    name: "Nina Petit",
    email: "nina.petit.data@gmail.com",
    headline: "Analytics engineer — dbt, warehouse modelling, metrics layers",
    skills: [
      "dbt",
      "SQL",
      "Snowflake",
      "Looker",
      "Python",
      "Data modelling",
      "Metrics governance",
    ],
    source: "referral",
    addedDays: 18,
    cv: `Analytics engineer, five years, currently at Monzo on the data-modelling team: she co-owns the core dbt project (thousands of models, hundreds of contributors) and led the metrics-layer consolidation that ended the era of four subtly different "active customer" definitions in board packs. Her craft is the unglamorous heart of data work — naming, testing, contracts, documentation — done to a standard that makes downstream analysts fast and confident.

Started as an analyst at a French retail group in Lille, moved to London and into analytics engineering as the discipline was being named. Python is workmanlike; her genius is in SQL and structure. She talks about data models the way good API designers talk about interfaces: consumers first, breaking changes as a last resort, deprecation with dignity.

French, settled status, London, hybrid fine. Eight weeks notice (Monzo standard). Referred by Sofia Marchetti from a dbt meetup. Wants a smaller company where she can set the standard rather than maintain one — a first-analytics-engineer role would suit her perfectly. Salary expectation £80–85k.`,
  },
  {
    n: 54,
    name: "Ade Fashola",
    email: "ade.fashola.ops@gmail.com",
    headline: "DevOps engineer — cost optimisation and platform pragmatism",
    skills: [
      "AWS",
      "Terraform",
      "Kubernetes",
      "FinOps",
      "Python",
      "GitHub Actions",
      "Datadog",
    ],
    source: "linkedin",
    addedDays: 34,
    cv: `DevOps engineer, seven years, currently at a Series C martech company where he is the platform team's cost conscience and Terraform lead: his savings-plan restructure and right-sizing programme cut the AWS bill by £900k a year — a number he presents with receipts, because he had to build the tagging discipline that made it measurable first. Beyond FinOps: standard modern estate ownership, EKS, GitHub Actions pipelines, Datadog, and a knack for the boring reliability work (backup restores actually tested, DNS actually documented) that only gets noticed when it is missing.

Career path is steady mid-market — a logistics firm, an agency, now martech — no glamour names, consistently strong references. He is the engineer who makes a platform sane rather than impressive, and he is at peace with that positioning.

British-Nigerian, Romford-based, hybrid fine, on-site-heavy also fine — he genuinely likes being in the room. One month notice. Salary expectation £78–85k. The Portside brief could have been written for him; flag the Felixstowe on-site pattern as a positive, not an apology.`,
  },
  {
    n: 55,
    name: "Megan Clarke",
    email: "megan.clarke.qa@outlook.com",
    headline: "QA lead — quality strategy across squads, automation background",
    skills: [
      "Test strategy",
      "Playwright",
      "Quality coaching",
      "CI/CD",
      "Risk-based testing",
      "Team leadership",
    ],
    source: "linkedin",
    addedDays: 47,
    cv: `QA lead, nine years, currently at Sage where she leads quality across four squads on the payroll product — a domain where a bug is not an inconvenience but someone's rent money arriving wrong. She moved the group from a manual-regression bottleneck to risk-based automation (Playwright, contract tests at service boundaries), cut release-cycle QA time from nine days to two, and coaches engineers to own quality rather than throw builds over a wall. Her quality strategy documents are the kind other departments quietly copy.

Background before Sage: automation roles at a travel company and a council software supplier — a decade of learning that quality is a system property, not a testing phase, and she talks about it with conviction that lands.

Newcastle-based, remote-first essential; Sage's return-to-office push is precisely why she is looking. One month notice. Salary expectation £75–80k. Wants a scale-up where she defines the quality function rather than inheriting one. Warm, direct, very strong on panels — she interviews the company right back.`,
  },
  {
    n: 56,
    name: "Pablo Herrera",
    email: "pablo.herrera.eng@gmail.com",
    headline: "Backend engineer — Python, ML platforms and APIs",
    skills: [
      "Python",
      "FastAPI",
      "PostgreSQL",
      "Kafka",
      "MLOps",
      "Docker",
      "AWS",
    ],
    source: "job-board",
    addedDays: 19,
    cv: `Backend engineer, seven years, currently at a computer-vision scale-up in Barcelona (remote-friendly, he is in London three years now, pre-settled status) building the serving platform around the models: FastAPI services, feature pipelines, the queueing and batching layer that keeps GPU inference efficient under spiky demand. He is the bridge profile — engineers trust his API discipline, data scientists trust him not to break their assumptions, and he has strong instincts for where that boundary should sit.

Earlier: a Madrid bank's innovation lab (two years, taught him regulated-environment patience) and a masters at UPC. System design is competent and improving — he reasons well about queues and data flow, more hesitantly about multi-region concerns he has not yet operated.

Spanish, London-based, hybrid fine. One month notice. Salary expectation £80–85k. Looking for a product company where the backend problems are varied rather than model-serving forever — payments, energy or logistics would all suit. Easy, collaborative interview presence; reference checks came back warm before we even finished asking.`,
  },
  {
    n: 57,
    name: "Freya Nilsen",
    email: "freya.nilsen@icloud.com",
    headline: "Junior frontend developer — ex-retail management, self-taught",
    skills: [
      "JavaScript",
      "React",
      "TypeScript",
      "CSS",
      "Shopify",
      "Figma basics",
    ],
    source: "referral",
    addedDays: 80,
    archived: true,
    cv: `Junior frontend developer, self-taught over two years of dawn study sessions while managing a flagship & Other Stories store — a retail-management career (seven years, teams of twenty, brutal Christmas peaks) that gave her more stakeholder experience than most mid-level engineers. Built and shipped three real projects before anyone paid her to code: a rota-planning tool her old district actually used, a Shopify theme for a friend's ceramics brand, and a very polished personal site that got her noticed.

Retail instincts transfer directly to e-commerce work: she thinks about conversion, stock states and the customer's patience because she has watched all three at the till. Code is junior but clean; her learning velocity is the sell.

PLACED: Bloom & Forage hired her for the frontend engineer role — Poppy loved that she had "actually sold things to actual people". Six-month review outstanding on both sides; she has already shipped the gift-bundles page solo. Archived as a successful placement, fee paid, and she sends us thank-you messages that make the whole job feel worth it. Check in at the one-year mark.`,
  },
  {
    n: 58,
    name: "Iqbal Chowdhury",
    email: "iqbal.chowdhury@gmail.com",
    headline:
      "Senior fullstack engineer — agency veteran, available immediately",
    skills: [
      "TypeScript",
      "React",
      "Node.js",
      "Next.js",
      "PostgreSQL",
      "AWS",
      "Client delivery",
    ],
    source: "outreach",
    addedDays: 13,
    cv: `Senior fullstack engineer, eleven years, the last six at a well-regarded London product agency where he was technical lead on builds for names you would recognise: a museum's ticketing replatform, a challenger insurer's quote engine, a national charity's donation platform that survives its annual telethon spike. Agency life made him fast, versatile and unflappable with stakeholders; he has scoped, built and handed over more production systems than most engineers see in a career.

The agency closed abruptly last month (funding pulled), so he is available immediately — a rare thing at his level and priced as such. He is choosing product over another agency deliberately: "I want to see version two of something I built" is how he put it, and it rang true.

The conversion risk is the standard one — agency pacing versus product patience, breadth versus system depth — and he discusses it with self-awareness rather than defensiveness. British-Bangladeshi, East London, hybrid fine. Salary expectation £85–90k, slightly negotiable given the timing. Strong, warm communicator; clients always asked for him by name.`,
  },
  {
    n: 59,
    name: "Tessa Bright",
    email: "tessa.bright.pm@outlook.com",
    headline: "Product manager — healthtech, regulated products",
    skills: [
      "Healthtech",
      "Regulatory compliance",
      "Clinical safety (DCB0129)",
      "Discovery",
      "Roadmapping",
      "Stakeholder management",
    ],
    source: "linkedin",
    addedDays: 48,
    cv: `Product manager, seven years, five in healthtech. Currently at a digital-therapeutics company taking a CBT-based insomnia product through NHS procurement — she owns the product through the collision of clinical evidence requirements, DCB0129 clinical-safety documentation and actual user needs, and she can explain that collision better than anyone we have interviewed. Earlier: two years at EMIS on GP-facing workflow tools, and a health-policy masters that still shapes how she frames problems.

Her superpower is regulated-product judgement: what needs a safety case, what needs a clinician sign-off, what is genuinely just a product decision wearing a compliance costume. Commercial and growth instincts are the softer edge — she has always worked where the buyer is an institution, and consumer-metrics fluency is thinner than her polish suggests.

Bristol-based, one to two London days fine. Six weeks notice. Salary expectation £85k. Should be shortlisted for any clinical-adjacent product role instantly; for consumer-growth briefs she is a stretch and both sides should know it going in.`,
  },
  {
    n: 60,
    name: "Noah Sterling",
    email: "noah.sterling@fastmail.com",
    headline: "Staff frontend architect — micro-frontends at banking scale",
    skills: [
      "React",
      "TypeScript",
      "Micro-frontends",
      "Module Federation",
      "Design systems",
      "System design",
      "Node.js",
    ],
    source: "outreach",
    addedDays: 34,
    cv: `Staff-level frontend architect, twelve years, currently at Lloyds Banking Group where he architected the micro-frontend platform that lets forty teams ship independently into one retail-banking web experience — Module Federation, contract-tested shared shells, a versioned design-system pipeline, and the governance model that stops forty teams shipping forty headers. It is the largest-scale frontend architecture work on our books, and he discusses its failures (an over-federated first attempt he unwound) as fluently as its wins.

Before Lloyds: Sky (five years, video player platform) and a startup that gave him the scrappy years. He operates like a backend staff engineer who happens to live in the browser: RFCs, failure budgets, dependency contracts. The fintech context runs deep — accessibility regulation, change control, fraud-team collaborations.

Motivation to move: Lloyds pace, said with affection and finality. He wants a scale-up where the frontend platform decisions are still being made. London, hybrid. Twelve weeks notice, some flexibility. Comp expectation £115–125k. Panels below staff level will struggle to test him — brief clients accordingly.`,
  },
];

const allCandidates: CandidateSeed[] = [
  ...candidates,
  ...candidatesB,
  ...candidatesC,
];

type Stage =
  | "applied"
  | "screening"
  | "interviewing"
  | "offer"
  | "hired"
  | "rejected";
type ApplicationSeed = [
  cand: number,
  job: string,
  stage: Stage,
  appliedDays: number,
  stageDays: number,
];

const applications: ApplicationSeed[] = [
  [1, "sfe-lumapay", "interviewing", 20, 6],
  [17, "sfe-lumapay", "offer", 32, 3],
  [12, "sfe-lumapay", "screening", 40, 24],
  [35, "sfe-lumapay", "interviewing", 25, 8],
  [45, "sfe-lumapay", "screening", 12, 5],
  [31, "sfe-lumapay", "applied", 7, 7],
  [60, "sfe-lumapay", "interviewing", 30, 10],
  [51, "sfe-lumapay", "rejected", 55, 35],
  [19, "sfe-lumapay", "rejected", 60, 42],
  [2, "be-payments-lumapay", "interviewing", 18, 4],
  [14, "be-payments-lumapay", "offer", 35, 2],
  [16, "be-payments-lumapay", "interviewing", 22, 7],
  [33, "be-payments-lumapay", "screening", 38, 19],
  [43, "be-payments-lumapay", "interviewing", 28, 9],
  [56, "be-payments-lumapay", "applied", 10, 10],
  [42, "be-payments-lumapay", "screening", 14, 8],
  [6, "staff-platform-stackline", "offer", 40, 4],
  [27, "staff-platform-stackline", "interviewing", 26, 6],
  [37, "staff-platform-stackline", "interviewing", 20, 5],
  [47, "staff-platform-stackline", "screening", 36, 21],
  [10, "staff-platform-stackline", "applied", 8, 8],
  [20, "staff-platform-stackline", "rejected", 58, 40],
  [29, "staff-platform-stackline", "rejected", 62, 44],
  [4, "devops-portside", "interviewing", 24, 6],
  [41, "devops-portside", "screening", 11, 6],
  [54, "devops-portside", "offer", 30, 2],
  [20, "devops-portside", "interviewing", 16, 5],
  [29, "devops-portside", "applied", 9, 9],
  [10, "devops-portside", "rejected", 45, 28],
  [5, "data-eng-helixcare", "interviewing", 21, 5],
  [23, "data-eng-helixcare", "offer", 33, 3],
  [39, "data-eng-helixcare", "interviewing", 19, 6],
  [53, "data-eng-helixcare", "screening", 13, 7],
  [40, "data-eng-helixcare", "screening", 35, 17],
  [30, "data-eng-helixcare", "applied", 6, 6],
  [49, "data-eng-helixcare", "rejected", 52, 36],
  [13, "data-eng-helixcare", "hired", 80, 40],
  [9, "pm-growth-bloom", "interviewing", 17, 4],
  [36, "pm-growth-bloom", "interviewing", 23, 8],
  [21, "pm-growth-bloom", "screening", 10, 4],
  [46, "pm-growth-bloom", "applied", 7, 7],
  [59, "pm-growth-bloom", "rejected", 44, 29],
  [3, "fullstack-nimbus", "interviewing", 25, 7],
  [15, "fullstack-nimbus", "offer", 29, 2],
  [28, "fullstack-nimbus", "interviewing", 18, 5],
  [52, "fullstack-nimbus", "screening", 32, 16],
  [58, "fullstack-nimbus", "screening", 9, 4],
  [22, "fullstack-nimbus", "applied", 11, 11],
  [33, "fullstack-nimbus", "applied", 7, 7],
  [50, "fullstack-nimbus", "hired", 85, 38],
  [8, "be-go-voltgrid", "interviewing", 27, 9],
  [37, "be-go-voltgrid", "offer", 31, 1],
  [43, "be-go-voltgrid", "applied", 10, 10],
  [56, "be-go-voltgrid", "screening", 15, 8],
  [33, "be-go-voltgrid", "rejected", 49, 31],
  [25, "be-go-voltgrid", "rejected", 47, 34],
  [7, "fe-bloom", "interviewing", 19, 3],
  [26, "fe-bloom", "interviewing", 24, 6],
  [11, "fe-bloom", "screening", 12, 5],
  [24, "fe-bloom", "applied", 6, 6],
  [38, "fe-bloom", "offer", 28, 2],
  [51, "fe-bloom", "applied", 9, 9],
  [57, "fe-bloom", "hired", 75, 36],
  [32, "eng-lead-helixcare", "interviewing", 26, 7],
  [6, "eng-lead-helixcare", "applied", 13, 13],
  [27, "eng-lead-helixcare", "applied", 10, 10],
  [58, "eng-lead-helixcare", "rejected", 51, 37],
  [60, "eng-lead-helixcare", "screening", 14, 6],
  [29, "sre-stackline", "interviewing", 22, 6],
  [10, "sre-stackline", "offer", 34, 2],
  [47, "sre-stackline", "interviewing", 21, 8],
  [20, "sre-stackline", "applied", 7, 7],
  [4, "sre-stackline", "applied", 11, 11],
  [41, "sre-stackline", "rejected", 46, 30],
  [42, "be-brickrow", "interviewing", 20, 5],
  [43, "be-brickrow", "screening", 12, 4],
  [2, "be-brickrow", "applied", 9, 9],
  [25, "be-brickrow", "applied", 6, 6],
  [44, "be-brickrow", "hired", 78, 39],
  [16, "be-brickrow", "rejected", 54, 38],
];

type InterviewSeed = {
  cand: number;
  job: string;
  round: string;
  days: number;
  interviewer: string;
  outcome: "pending" | "pass" | "fail";
  feedback: string;
};

const interviews: InterviewSeed[] = [
  {
    cand: 1,
    job: "sfe-lumapay",
    round: "Recruiter screen",
    days: 7,
    interviewer: "Dana Whitmore",
    outcome: "pass",
    feedback: `Sharp screen. Priya asked about our reconciliation data model before I had finished describing the team, and her follow-ups showed she has actually lived inside payments UI, not just styled it. The Monzo wealth work maps almost one-to-one onto our merchant dashboard problems, and the design-system ownership is a bonus we did not advertise for. She was direct that product influence matters more to her than title, which suits how this squad runs. One watch-out: she is clearly interviewing selectively and will not tolerate a slow process. Straight to the technical round, this week if we can.`,
  },
  {
    cand: 35,
    job: "sfe-lumapay",
    round: "Technical interview",
    days: 8,
    interviewer: "Rob Chalmers",
    outcome: "pass",
    feedback: `Very strong session. Arjun profiled our sluggish demo grid live, found the re-render storm in about four minutes, and then explained three ways to fix it ranked by risk — the ranking impressed me more than the diagnosis. His WebSocket multiplexing war stories from IG are directly relevant to the streaming-balance work on our roadmap. Depth over breadth profile: he was honest that content-heavy or marketing-page work would bore him, so we should be honest back about how much dashboard versus general product work this role carries. Clear pass to the next stage from me.`,
  },
  {
    cand: 60,
    job: "sfe-lumapay",
    round: "System design",
    days: 4,
    interviewer: "Rob Chalmers",
    outcome: "pass",
    feedback: `The strongest architectural conversation I have had on the frontend side of this company, full stop. Noah took our micro-frontend question, challenged its premise politely, and then designed a federation model including the governance layer — versioning contracts, deprecation policy, the boring parts everyone else skips. What sold me completely was him walking through the over-federated first attempt at Lloyds and how he unwound it: he narrates his own failures with more insight than most candidates narrate their wins. Concern is purely fit-to-level — he may be bored unless we genuinely hand him the platform direction. Emphatic pass.`,
  },
  {
    cand: 17,
    job: "sfe-lumapay",
    round: "Technical interview",
    days: 10,
    interviewer: "Rob Chalmers",
    outcome: "pass",
    feedback: `Excellent. Nadia treats component APIs the way our backend folk treat service contracts — she talked about breaking changes, versioning and deprecation policy for a design system with real rigour, and her accessibility knowledge is the deepest I have personally interviewed. The ClearBank back-office years mean she understands reconciliation as an operation, not just a screen. Code exercise was clean, tested, and she narrated trade-offs unprompted. No technical reservations at all; the only question for the final round is scope and money, because she is currently well paid and knows her market. Strong pass.`,
  },
  {
    cand: 17,
    job: "sfe-lumapay",
    round: "Final",
    days: 4,
    interviewer: "Dana Whitmore",
    outcome: "pass",
    feedback: `Unanimous yes on ability — she would raise the bar on this team from day one, and her design-system plan for our fragmented component estate was better than the internal proposal we paid a quarter for. The complication is entirely compensation: she is on £98k plus a real bonus and her number is £112k, which is £7k above the very top of band. I want to make this work — either comp sign-off for an exception or a genuinely compelling equity story — but I need finance's answer before Friday or we will lose her to whoever moves first. Recommend offer at maximum stretch.`,
  },
  {
    cand: 51,
    job: "sfe-lumapay",
    round: "Technical interview",
    days: 37,
    interviewer: "Femi Adebayo",
    outcome: "fail",
    feedback: `Frustrating session because the raw ability is obviously there. Katya crushed the algorithmic portion — cleanest virtualisation reasoning I have seen — but when we moved to open-ended discussion about performance in product terms she went quiet, gave fragments, and visibly lost confidence. Asked how she would explain a perf trade-off to a designer, she answered in big-O notation. For a senior role on a collaborative squad that is a real problem today, not a rounding error. I would genuinely revisit her in a more structured interview format or for a deeper-specialist role, but for this vacancy it is a no.`,
  },
  {
    cand: 19,
    job: "sfe-lumapay",
    round: "Culture fit",
    days: 44,
    interviewer: "Dana Whitmore",
    outcome: "fail",
    feedback: `One of the most likeable candidates this quarter and the portfolio is genuinely gorgeous — the motion work is a level above anything we ship. But every time I pushed on why a technical choice was made, the answer stopped at the surface: she could tell me what felt right, not what the constraints were, and when I asked how her prettiest project handled state at scale she conceded it never had to. Great collaborator energy, wrong seniority for a senior req that owns architecture. Would enthusiastically interview her again in two years, or tomorrow for a mid role on a craft-led team. Not for this one.`,
  },
  {
    cand: 2,
    job: "be-payments-lumapay",
    round: "Recruiter screen",
    days: 5,
    interviewer: "Femi Adebayo",
    outcome: "pass",
    feedback: `Good screen. Tom is exactly the shape this role wants: the Paddle dunning and proration work is real money-handling experience, and his line that "every way a webhook can lie to you" turned into a genuinely useful five-minute taxonomy — he was not reciting, he was remembering. Motivation checks out too: he wants payments as the product rather than a cost centre, which is literally our pitch. Slightly light on infrastructure, self-declared, but we have platform coverage. Comp expectation sits inside band. Advance to technical; I would also fast-track him, as he interviews like someone others will move on quickly.`,
  },
  {
    cand: 16,
    job: "be-payments-lumapay",
    round: "System design",
    days: 6,
    interviewer: "Rob Chalmers",
    outcome: "pass",
    feedback: `Best system design round I have run this year, and I do not say that lightly. Viktor redesigned our transfer-state handling on the whiteboard, arrived independently at the outbox pattern we use, and then identified a schema-evolution gap that we genuinely have and have been quietly avoiding. His Wise experience is not adjacent to our problems, it is our problems. The known flag showed mildly: he enjoys being the smartest person in the room. In a round with me it was fine, even fun; the panel for his next stage should include Dana so he calibrates. Technical yes without hesitation.`,
  },
  {
    cand: 43,
    job: "be-payments-lumapay",
    round: "Technical interview",
    days: 8,
    interviewer: "Femi Adebayo",
    outcome: "pass",
    feedback: `Quietly excellent. George sketched a partitioning and rebalancing scheme for our webhook fanout that is close to what our own payments spine does, except he got there in forty minutes from a cold start and included load numbers and failure domains without being asked — the instinct you cannot teach. Booking-scale read-path experience translates well even though his stack is JVM and ours is Node; he was refreshingly unbothered by the language question and talked in systems, not syntax. Communication plain and unshowy. Wants product visibility, and payments interests him explicitly. Definite pass; he is senior-plus in mid-role clothing, and we should discuss levelling before offer stage.`,
  },
  {
    cand: 14,
    job: "be-payments-lumapay",
    round: "System design",
    days: 9,
    interviewer: "Rob Chalmers",
    outcome: "pass",
    feedback: `Oluwaseun made our hardest interview problem look routine. Exactly-once webhook processing, idempotency under retry storms, backpressure when a PSP goes slow — he answered in the calm, precise register of someone who has operated systems where mistakes cost real money in microseconds. His design instincts are exceptional: he budgeted latency and failure probability the way other candidates budget story points. The LMAX-to-payments motivation story holds up; he wants product context back and says so credibly. Softly spoken until the problem got hard, then a completely different energy. Strong yes. Note his twelve-week notice for planning.`,
  },
  {
    cand: 14,
    job: "be-payments-lumapay",
    round: "Final",
    days: 3,
    interviewer: "Dana Whitmore",
    outcome: "pass",
    feedback: `Clear final-round yes — the panel was unanimous inside ten minutes of the debrief. The urgency note is the point of this write-up: he disclosed, entirely professionally, that he holds a verbal offer from a challenger bank with a deadline this Friday. He prefers our problem space and said the payments-as-product framing is why we are ahead, but he will not let a bird in hand expire for a maybe. We are not negotiating against ourselves on comp — his ask is inside band. We are negotiating against the calendar. Offer paperwork today, please.`,
  },
  {
    cand: 6,
    job: "staff-platform-stackline",
    round: "System design",
    days: 7,
    interviewer: "Ana Duarte",
    outcome: "pass",
    feedback: `Flawless, and my bar for this round is famously unkind. James sharded our ingest tier on the whiteboard, called out the failure modes before I could ask my prepared questions, and then — unprompted — talked through blast-radius containment and what he would deliberately not build in year one. The Cloudflare config-propagation work is the closest external analogue to our pipeline that exists. He interviews like a peer reviewing a design doc, which is precisely the staff behaviour we are hiring for. I have no technical reservations whatsoever. Get him in front of the founders before someone else's final round does.`,
  },
  {
    cand: 6,
    job: "staff-platform-stackline",
    round: "Final",
    days: 5,
    interviewer: "Ana Duarte",
    outcome: "pass",
    feedback: `Final confirmed what the design round promised, and the founders felt it too. Two material notes for the offer conversation. First, he is at final stage in two other processes and one is a household-name platform team with a comp ceiling we cannot match in cash — our route is equity and scope, and he engaged seriously with both, asking sharper questions about the cap table than most investors do. Second, he was candid that architecture ownership is the decision criterion: if the role is a tech-lead-in-disguise he walks. It is not, and I told him so in writing. Move fast; strong hire.`,
  },
  {
    cand: 27,
    job: "staff-platform-stackline",
    round: "Technical interview",
    days: 6,
    interviewer: "Mark Hollis",
    outcome: "pass",
    feedback: `Stefan thinks in systems the way the best platform people do — control plane versus data plane, paved roads with escape hatches, golden paths priced by the friction they remove. His Zalando bootstrap-time story (three days to forty minutes) survived hostile questioning: he knew the before-and-after numbers, the migration sequencing, and what he would do differently. What impressed me most was the texture of his honesty — twice he said "I don't know, here is how I would find out" without a flicker of discomfort, and both answers were good. Wants smaller scale on purpose. He and James O'Donnell are genuinely different flavours of excellent; lucky problem to have. Pass.`,
  },
  {
    cand: 20,
    job: "staff-platform-stackline",
    round: "Technical interview",
    days: 42,
    interviewer: "Ana Duarte",
    outcome: "fail",
    feedback: `Not at the level for this role, and it was clear early. Peter's answers name-checked the right tools — Terraform modules, EKS upgrades, GitLab pipelines — but every time I pushed one layer down the response went hand-wavy: asked why he would choose a pattern he described, he restated the pattern in vendor vocabulary rather than reasoning from first principles. Asked to design from a blank page, he reached for what his current employer does and could not defend it. To be fair to him, he executes established patterns competently and would be a fine engineer inside a larger platform org. That is a different job from this one. No.`,
  },
  {
    cand: 4,
    job: "devops-portside",
    round: "Technical interview",
    days: 6,
    interviewer: "Gavin Shaw",
    outcome: "pass",
    feedback: `Impressed. Daniel is the first candidate for this role who lit up rather than winced when I described the 2009 ERP that will outlive us all — his fourteen-month coexistence migration story matched our situation almost embarrassingly closely, zero unplanned downtime, and he could name the boring controls that made it true. Azure depth is real, Terraform discipline evident, and his alert-hygiene line ("an alert nobody acts on is a bug") is going on the office wall. Sponsorship is required but he arrived with the Skilled Worker process already researched, which tells you about the man. Confirmed he is fine with Felixstowe Tuesdays and Thursdays. Pass, and my preferred candidate so far.`,
  },
  {
    cand: 54,
    job: "devops-portside",
    round: "Final",
    days: 3,
    interviewer: "Gavin Shaw",
    outcome: "pass",
    feedback: `Ade is the one. The £900k AWS savings story checked out in detail — he walked me through the tagging discipline that made it measurable, which is exactly the unglamorous rigour this estate needs, and he genuinely likes being on site, which puts him in a minority of one among our shortlist. The wrinkle is money: he is expecting £85k and our band stops at £78k. I think he is worth the difference and cheaper than a second bad hire, but I cannot break the band without the FD's signature. Recommend we request the exception this week; if it is refused, offer at top of band plus the training budget and let me make the case to him personally.`,
  },
  {
    cand: 10,
    job: "devops-portside",
    round: "Technical interview",
    days: 30,
    interviewer: "Leanne Porter",
    outcome: "fail",
    feedback: `A no for this role, with some regret. Rashid's CV credentials are obviously real, but the interview never found its footing: asked to walk through a major incident, he circled through context for eight minutes without reaching the decision points, and when I tried to structure it for him he restarted the story rather than answering the question. It may partly be nerves and partly a mismatch — he operates at bank-scale process and we need someone hands-on across a small messy estate. Communication matters here because our engineers double as the help desk on bad days. Not right for Portside; I suspect he shines somewhere with more ceremony.`,
  },
  {
    cand: 5,
    job: "data-eng-helixcare",
    round: "Technical interview",
    days: 5,
    interviewer: "Tom Akintola",
    outcome: "pass",
    feedback: `Strong pass. Sofia's Redshift-to-lakehouse migration story had the two qualities I always probe for: real numbers (two months early, forty percent under compute budget) and real regret (she would sequence the dbt contract-testing earlier next time — the fact she introduced contract testing at all puts her ahead of the field). She asked sharper information-governance questions than some of our own staff, unprompted, and her instinct to sit with downstream consumers before building matches how our clinical analysts actually work. Streaming depth is limited, self-declared, but our roadmap is batch-first for a year. Advance to final with Naomi.`,
  },
  {
    cand: 39,
    job: "data-eng-helixcare",
    round: "System design",
    days: 6,
    interviewer: "Tom Akintola",
    outcome: "pass",
    feedback: `Kwame effectively designed our next two years in an hour. Given the FHIR ingestion problem, he proposed a streaming backfill architecture with a clean separation of the hot path from the cold — the exact shape I have been failing to get funded — and then, unprompted, addressed schema-registry governance so trusts cannot break each other's feeds, which is our actual recurring incident. His exactly-once reasoning was rigorous without being showy, and he translated everything into clinical-consequence terms for the non-engineers in the room. That translation instinct is rare and this company runs on it. Emphatic pass; pair his final round with Naomi.`,
  },
  {
    cand: 23,
    job: "data-eng-helixcare",
    round: "Final",
    days: 4,
    interviewer: "Dr. Naomi Field",
    outcome: "pass",
    feedback: `Clinically and technically the best-fitted candidate we have seen for this post — her trust-side experience means she treats data quality as a patient-safety issue by reflex, and her ED-attendance unification story involved precisely the cross-site politics this role will face. I want to appoint. Two hesitations for the record, both about compensation: her stated expectation has moved from £88k at screen to £95k now, and she has asked for a salary review commitment at six months. Neither is unreasonable given NHS-to-market adjustment, but the band is £90–105k and finance will want the six-month clause struck or capped. Resolve this quickly; she is referred and networked and will not stay available.`,
  },
  {
    cand: 13,
    job: "data-eng-helixcare",
    round: "Final",
    days: 44,
    interviewer: "Dr. Naomi Field",
    outcome: "pass",
    feedback: `Appointing. Ingrid's Babylon-era model-governance experience is exactly what our clinical-safety casework needs — she has run model cards, drift monitoring and an actually-exercised rollback under review conditions, which almost nobody in this market has done for real. Her judgement is the differentiator: her line that "a logistic regression beat the transformer and shipped in a week" is the sensibility I want setting precedent here. She was honest that the consultancy year bored her; the mission fit with us is obvious and mutual. Offer approved at panel, references waived to verbal given the referrer. Delighted with this one.`,
  },
  {
    cand: 9,
    job: "pm-growth-bloom",
    round: "Culture fit",
    days: 4,
    interviewer: "Poppy Lane",
    outcome: "pass",
    feedback: `Really liked her. Hannah brought actual experiment write-ups — including the failures, which is the tell I look for — and her Gousto skip-versus-cancel work is the closest analogue to our subscription-pause problem that exists in the UK market. She pulls her own cohorts in SQL, so she will not be blocked by our tiny data team, and she handled the brand-team scenario question with more warmth than most growth people can fake. Honest that pure acquisition bores her; fine, that is not this role. She would raise our experiment discipline overnight. Advance, and let us not dawdle — she reads like someone with options.`,
  },
  {
    cand: 36,
    job: "pm-growth-bloom",
    round: "Recruiter screen",
    days: 9,
    interviewer: "Poppy Lane",
    outcome: "pending",
    feedback: `Split feelings, recording as pending rather than forcing a call. Charlotte is impressively polished — the GoCardless pricing-and-packaging story is disciplined, co-credited honestly, and her customer-discovery cadence is the most rigorous on this shortlist. But it is all B2B: buyer-versus-user dynamics, procurement cycles, dashboard products. Asked about consumer repeat-purchase mechanics she reasoned intelligently from first principles, which is promising but not the same as having done it, and she said as much herself before I could. I want a consumer-shaped case exercise before deciding either way. If she converts that round, her rigour might beat the specialists.`,
  },
  {
    cand: 59,
    job: "pm-growth-bloom",
    round: "Culture fit",
    days: 31,
    interviewer: "Poppy Lane",
    outcome: "fail",
    feedback: `Wrong role, said with respect. Tessa has a superb regulatory brain — her explanation of clinical-safety casework versus ordinary product decisions was genuinely fascinating — but this is a growth job at a food-and-lifestyle brand and the conversation kept sliding back to institutional buyers and evidence frameworks. Twice I asked about funnel instincts and got governance answers; she was talking past the question rather than to it. I do not think she actually wants this job so much as a job, and hiring a brilliant person into the wrong seat helps nobody. If we ever build a regulated wellness line, call her first. For this req, a no.`,
  },
  {
    cand: 3,
    job: "fullstack-nimbus",
    round: "Technical interview",
    days: 7,
    interviewer: "Elliot Fry",
    outcome: "pass",
    feedback: `Quality candidate. Amara's nine-weeks-to-national-rollout story survived my usual interrogation — she could name the corners cut, the ones deliberately not cut, and the monitoring she added before scale-up, which is the shipped-under-pressure texture I hire for. Range is real: schema design through React without a seam. The healthtech IG discipline translates surprisingly well to our rights-management constraints around footage. She asked better questions about our match-day traffic spikes than the last SRE candidate did. No reservations; get her to final before her other processes wake up. Pass.`,
  },
  {
    cand: 15,
    job: "fullstack-nimbus",
    round: "Final",
    days: 3,
    interviewer: "Elliot Fry",
    outcome: "pass",
    feedback: `Hire — the editor conflict-resolution walkthrough alone was a final-round performance, and her BBC live-coverage instincts fit our spike-and-degrade world naturally. The commercial picture is the reason for this note: she has a scale-up offer in hand expiring at the end of next week and her agency-side contacts have floated a counter to keep her, though her startup's runway anxiety is clearly the true motivator and stability is our best card to play. Her number is inside our band. Straightforward decision on merit; the only way we lose this one is by being slow. Offer out within forty-eight hours, please.`,
  },
  {
    cand: 50,
    job: "fullstack-nimbus",
    round: "Final",
    days: 43,
    interviewer: "Elliot Fry",
    outcome: "pass",
    feedback: `Hired, and pleased about it. What sold me on Tunde was the combination I described in panel as boring-systems discipline plus startup recency — seven years of insurer-grade care about data integrity, then a genuine two-year retooling into TypeScript that finished with him rebuilding a quoting portal solo. He asked about support rotas before we could ask him about ambition, which told me everything about how he ships. Not the flashiest candidate on the shortlist; comfortably the one I trust most with our billing integration. Offer accepted at band midpoint. Onboarding him with the rights-renewal project first.`,
  },
  {
    cand: 8,
    job: "be-go-voltgrid",
    round: "System design",
    days: 9,
    interviewer: "Karl Jensen",
    outcome: "pass",
    feedback: `I gave Lukas our real firmware-rollout outage, unedited, and he took it apart methodically — triage sequencing, blast-radius containment, then the store-and-forward reconciliation design, where his exactly-once reasoning came from visible scars rather than blog posts. He asked for our message-volume numbers before proposing anything, which already puts him ahead of most seniors, and his consensus trade-off discussion was the best I have heard in this process. The Einride telemetry work is our problem domain wearing a different logo. Understated in manner; do not mistake it, the depth is exceptional. Hire before our competitors meet him. The climate motivation is genuine, which helps our comp position but should not be leaned on.`,
  },
  {
    cand: 37,
    job: "be-go-voltgrid",
    round: "Technical interview",
    days: 6,
    interviewer: "Karl Jensen",
    outcome: "pass",
    feedback: `Technically among the best we have run through this loop — the Klarna hot-path latency work is real (he narrated the GC-pause hunt like a detective story, and the numbers held up), and his load-shedding thinking maps directly onto our grid-response constraints. Clear pass on ability. The flag for the offer stage is compensation: his expectation is £110–120k, which is the very top of our band before we discuss his Rust ambitions, and he knows precisely what he is worth. He signalled flexibility for genuinely hard problems, and ours qualify. We should decide our ceiling before the final rather than discovering it live. One other process of his is at final stage — treat as urgent.`,
  },
  {
    cand: 25,
    job: "be-go-voltgrid",
    round: "Technical interview",
    days: 36,
    interviewer: "Ruth Mbeki",
    outcome: "fail",
    feedback: `Mixed, ultimately a no for this role. Yuki's Python craft is genuinely good — the zero-downtime migration playbook he described is careful, tested work — but this is a Go role in a heavily relational, high-concurrency domain and the gaps showed: his schema-design answers stayed at marketplace-CRUD depth, and concurrency questions got textbook rather than experienced responses. He was upfront that Mercari's platform team abstracted the hard distribution problems away, which I respect but cannot hire around here. The sponsorship lead time compounds the case against. Would happily see him again for a Python-first product role; he is better than this result suggests.`,
  },
  {
    cand: 7,
    job: "fe-bloom",
    round: "Technical interview",
    days: 4,
    interviewer: "Marcus Reid",
    outcome: "pass",
    feedback: `Lovely session. Mei-Ling talks about Core Web Vitals with revenue numbers attached — her ASOS image-loading work moved conversion 1.9% and she knew the confidence interval, which is not a sentence I get to write often. The agency Shopify years mean she has genuine sympathy for content editors, and she asked about our editorial workflow before asking about the stack, which is exactly the instinct this storefront needs. Playwright discipline strong, design collaboration style thoughtful (intent before pixels). Salary expectation fits comfortably. Pass, and I would move quickly — profiles this well-shaped for us are rare at mid level.`,
  },
  {
    cand: 38,
    job: "fe-bloom",
    round: "Final",
    days: 3,
    interviewer: "Poppy Lane",
    outcome: "pass",
    feedback: `Yes from me, and an easy one. Roisin has shipped through four peak trading seasons without a conversion-impacting incident, and when I pressed for the closest call she gave an honest, specific answer about a Black Friday cache stampede rather than a rehearsed humility line. The Vue-to-React conversion story shows real learning depth, and her wanting a smaller, kinder team after THG is a fit we can actually deliver rather than a promise we would be stretching. Slightly understated in person; her code samples carry the confidence her presentation undersells. Offer at the number discussed — she has earned the top of the range we floated.`,
  },
  {
    cand: 57,
    job: "fe-bloom",
    round: "Final",
    days: 41,
    interviewer: "Poppy Lane",
    outcome: "pass",
    feedback: `Hired her, and I would do it again this afternoon. Freya has actually sold things to actual people — seven Christmases on a shop floor — and it shows in how she thinks about stock states, customer patience and what a product page is for. The code is junior and she knows it; the learning velocity is not junior at all, and her rota-tool side project had real users and real bug reports she fixed at 6am before shifts. Panel worried briefly about the self-taught background; her take-home was cleaner than our last two mid-level hires' submissions. Offer accepted same day. Pair her with Marcus for the first quarter.`,
  },
  {
    cand: 32,
    job: "eng-lead-helixcare",
    round: "Leadership panel",
    days: 8,
    interviewer: "Dr. Naomi Field",
    outcome: "pass",
    feedback: `The panel was won over, including the sceptics. Kirsten's strangler-migration story at Babbel is nearly a rehearsal for our Django-to-services transition — she could name the sequencing, the metrics that told her it was working, and the quarter she deliberately paused it to ship product, which reassured our commercial director more than any architecture slide. Management philosophy is structured and humane; the zero-regretted-attrition claim came with names and context rather than as a slogan. Still technical enough to review designs credibly and honest about being eighteen months from production code. Clinical stakeholders responded well to her directness. Advance to final; she is the bar the other candidates now have to clear.`,
  },
  {
    cand: 29,
    job: "sre-stackline",
    round: "Technical interview",
    days: 7,
    interviewer: "Mark Hollis",
    outcome: "pass",
    feedback: `Dmitri is an observability specialist in the best sense — the OpenTelemetry rollout across 300 services was his programme end to end, and his alert-fatigue philosophy ("curated golden signals, delete the rest") is precisely the medicine our dashboard sprawl needs. His incident walkthroughs are textbook: structure, decision points, what changed afterwards. He was straightforward about the shape of his skills — deep on the watching, lighter on databases — which maps fine onto this role given where our pain actually is. Remote-heavy needs are compatible with our setup. Pass; Ana should probe capacity-planning depth at final, the one area I could not fully test.`,
  },
  {
    cand: 10,
    job: "sre-stackline",
    round: "Final",
    days: 3,
    interviewer: "Ana Duarte",
    outcome: "pass",
    feedback: `Strong final. Rashid held the room through a live incident simulation with the calm of someone who has run real bridge calls when the stakes were measured in headlines — his triage structure was clean, his delegation instincts genuine, and his error-budget-policy experience is a governance maturity we frankly lack. The banking-estate legacy shows in places (some tooling instincts a generation behind) but he named the gap himself and his homelab evidence of closing it was oddly persuasive. He wants reliability work that ships in days, not committee quarters, and that is exactly what we sell. Offer recommended at the discussed number.`,
  },
  {
    cand: 42,
    job: "be-brickrow",
    round: "Technical interview",
    days: 5,
    interviewer: "Owen Price",
    outcome: "pending",
    feedback: `Leaving this as pending because I want a second technical opinion, not because Leila underwhelmed. The payments-integration depth is genuine — her webhook-delivery war stories and the "webhooks are a distributed-systems problem" framing are exactly the scar tissue our rent-collection pipeline needs, and her Open Banking mandate-flow knowledge would shortcut months of our roadmap. The hesitation: her testing answers leaned on the harness she built rather than on strategy — asked how she would test a flow without her tooling, the answer thinned out noticeably. Might be framing, might be a gap. Nikki runs a second session next week focused there. Comp expectation fits the band, which matters here.`,
  },
  {
    cand: 44,
    job: "be-brickrow",
    round: "Final",
    days: 44,
    interviewer: "Owen Price",
    outcome: "pass",
    feedback: `Hired, and I want it on record that she beat two mid-level candidates on the practical, not on potential. Chloe's take-home was the cleanest submission of the whole process — small commits, honest README caveats, a test suite that tested behaviour rather than implementation — and in the pairing session she took correction once and never needed it repeated, which is the most coachable performance I have interviewed. The apprenticeship-over-university decision came with an articulate defence and zero chip on the shoulder. Offer at the top of the junior band, accepted. Ninety-day plan: rent-collection service under supervision, then the deposit-protection integration solo.`,
  },
];

function buildDocs(): SeedDoc[] {
  const jobKeys = new Set(jobs.map((j) => j.key));
  const candNums = new Set(allCandidates.map((c) => c.n));

  const appByKey = new Map<string, ApplicationSeed>();
  for (const app of applications) {
    const [cand, job, stage, appliedDays, stageDays] = app;
    if (!candNums.has(cand))
      throw new Error(`Application references unknown candidate ${cand}`);
    if (!jobKeys.has(job))
      throw new Error(`Application references unknown job ${job}`);
    if (appliedDays < stageDays) {
      throw new Error(
        `Application ${cand}-${job}: appliedAt must predate stageUpdatedAt`,
      );
    }
    const jobDef = jobs.find((j) => j.key === job);
    if (
      stage !== "hired" &&
      stage !== "rejected" &&
      jobDef?.status === "closed"
    ) {
      throw new Error(
        `Application ${cand}-${job}: active stage on a closed job`,
      );
    }
    appByKey.set(`${cand}-${job}`, app);
  }
  const interviewable = new Set(["interviewing", "offer", "hired", "rejected"]);
  for (const iv of interviews) {
    const app = appByKey.get(`${iv.cand}-${iv.job}`);
    if (!app)
      throw new Error(
        `Interview references unknown application ${iv.cand}-${iv.job}`,
      );
    if (!interviewable.has(app[2])) {
      throw new Error(
        `Interview on ${iv.cand}-${iv.job} but application stage is ${app[2]}`,
      );
    }
  }

  const maxAppliedByJob = new Map<string, number>();
  const maxAppliedByCand = new Map<number, number>();
  for (const [cand, job, , appliedDays] of applications) {
    maxAppliedByJob.set(
      job,
      Math.max(maxAppliedByJob.get(job) ?? 0, appliedDays),
    );
    maxAppliedByCand.set(
      cand,
      Math.max(maxAppliedByCand.get(cand) ?? 0, appliedDays),
    );
  }

  const companyDocs: SeedDoc[] = companies.map((c) => ({
    _id: sid("company", c.key),
    _type: "company",
    orgId,
    name: c.name,
    website: c.website,
    industry: c.industry,
    notes: c.notes,
  }));

  const jobDocs: SeedDoc[] = jobs.map((j) => ({
    _id: sid("job", j.key),
    _type: "job",
    orgId,
    title: j.title,
    description: j.description,
    seniority: j.seniority,
    salaryRange: j.salaryRange,
    status: j.status,
    company: ref(sid("company", j.company)),
    // A job always predates its oldest application.
    createdAt: daysAgo(
      Math.max(j.createdDays, (maxAppliedByJob.get(j.key) ?? 0) + 3),
    ),
  }));

  const candidateDocs: SeedDoc[] = allCandidates.map((c) => ({
    _id: sid("candidate", pad(c.n)),
    _type: "candidate",
    orgId,
    name: c.name,
    email: c.email,
    headline: c.headline,
    avatarUrl: `https://i.pravatar.cc/150?u=${sid("candidate", pad(c.n))}`,
    skills: c.skills,
    cvText: c.cv,
    source: c.source,
    archived: c.archived ?? false,
    createdAt: daysAgo(
      Math.max(c.addedDays, (maxAppliedByCand.get(c.n) ?? 0) + 2),
    ),
  }));

  const hashOf = (key: string): number => {
    let hash = 7;
    for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
    return Math.abs(hash);
  };

  const offerAmountFor = (cand: number, job: string): string => {
    const thousands = 55 + (hashOf(`${job}.${cand}`) % 41);
    return `£${thousands},000`;
  };

  const OFFER_NOTES = [
    "Base only — the client has room on equity if they push back.",
    "Matched their current base plus 9%. Start date still to agree.",
    "Verbal out Friday; written contract follows once HR sign off.",
    "They asked for a 4-day week — client said no, so this is base-heavy.",
    "Includes the £5k sign-on we negotiated to cover their lost bonus.",
    "Second offer on the table elsewhere — expect a counter this week.",
    "Client stretched past band for this one. Do not set a precedent.",
    "Relocation package agreed separately, not reflected in the figure.",
  ];
  const HIRED_NOTES = [
    "Accepted same day. Starts in four weeks once they work notice.",
    "Accepted after we moved the start date back a fortnight.",
    "Signed. Client wants them on the payments team from day one.",
    "Accepted the revised figure — they were counter-offered and stayed with us.",
  ];
  const offerNoteFor = (cand: number, job: string, hired: boolean): string => {
    const pool = hired ? HIRED_NOTES : OFFER_NOTES;
    return pool[hashOf(`note.${job}.${cand}`) % pool.length];
  };

  const applicationDocs: SeedDoc[] = applications.map(
    ([cand, job, stage, appliedDays, stageDays]) => ({
      _id: sid("application", `${pad(cand)}-${job}`),
      _type: "application",
      orgId,
      candidate: ref(sid("candidate", pad(cand))),
      job: ref(sid("job", job)),
      stage,
      appliedAt: daysAgo(appliedDays + 0.25),
      stageUpdatedAt: daysAgo(stageDays),
      ...(stage === "offer" || stage === "hired"
        ? {
            offerAmount: offerAmountFor(cand, job),
            offerSentAt: daysAgo(
              stage === "hired"
                ? Math.min(stageDays + 3, appliedDays)
                : stageDays,
            ),
            offerNote: offerNoteFor(cand, job, stage === "hired"),
          }
        : {}),
    }),
  );

  const interviewDocs: SeedDoc[] = interviews.map((iv) => ({
    _id: sid("interview", `${pad(iv.cand)}-${iv.job}-${slug(iv.round)}`),
    _type: "interview",
    orgId,
    application: ref(sid("application", `${pad(iv.cand)}-${iv.job}`)),
    roundName: iv.round,
    scheduledAt: daysAgo(iv.days),
    interviewer: iv.interviewer,
    outcome: iv.outcome,
    feedbackText: iv.feedback,
  }));

  return [
    ...companyDocs,
    ...jobDocs,
    ...candidateDocs,
    ...applicationDocs,
    ...interviewDocs,
  ];
}

const SEED_QUERY = '*[orgId == $orgId && _id in path("vetra.seed.**")]';

async function main() {
  if (wantsReset) {
    const existing: number = await client.fetch(`count(${SEED_QUERY})`, {
      orgId,
    });
    if (existing === 0) {
      console.log(`No seed documents found for ${orgId}. Nothing to delete.`);
      return;
    }
    await client.delete({ query: SEED_QUERY, params: { orgId } });
    console.log(`Deleted ${existing} seed documents for ${orgId}.`);
    return;
  }

  await client.createIfNotExists({
    _id: `org.${orgId}`,
    _type: "organization",
    name: orgId,
    clerkOrgId: orgId,
    createdAt: new Date().toISOString(),
  });

  const organization = {
    _type: "reference" as const,
    _ref: `org.${orgId}`,
    _weak: true,
  };
  const docs = buildDocs().map((doc) => ({ ...doc, organization }));

  const BATCH = 50;
  for (let i = 0; i < docs.length; i += BATCH) {
    const chunk = docs.slice(i, i + BATCH);
    let tx = client.transaction();
    for (const doc of chunk) tx = tx.createOrReplace(doc);
    await tx.commit();
    console.log(
      `Committed ${Math.min(i + BATCH, docs.length)}/${docs.length} documents...`,
    );
  }

  const counts = new Map<string, number>();
  for (const doc of docs)
    counts.set(doc._type, (counts.get(doc._type) ?? 0) + 1);

  console.log(`\nSeeded ${dataset} for ${orgId}:`);
  for (const type of [
    "company",
    "job",
    "candidate",
    "application",
    "interview",
  ]) {
    console.log(`  ${type.padEnd(12)} ${counts.get(type) ?? 0}`);
  }
  console.log(`  ${"total".padEnd(12)} ${docs.length}`);
  console.log(
    "\nRe-running is safe: every _id is deterministic and createOrReplace overwrites in place.",
  );
}

main().catch((err) => {
  console.error("Seed failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
