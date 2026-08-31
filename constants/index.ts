export const QUERIES = [
  "who's stalled in screening?",
  "React candidates with fintech experience",
  "who gave strong system-design answers?",
  "move Priya to offer",
  "which clients have no active candidates?",
  "log that Henrik passed his tech screen",
  "who mentioned competing offers?",
  "source candidates for the Lumapay role",
];

export const FAQS = [
  {
    q: "Where do the AI's answers come from?",
    a: "Only from your workspace — the CVs, debriefs and pipeline your team has logged. Every answer links to its source records.",
  },
  {
    q: "Can the AI reject candidates?",
    a: "No. It retrieves, summarises and carries out explicit instructions like moving a stage. Hiring judgements stay with people.",
  },
  {
    q: "How do seats work?",
    a: "Plans are per agency workspace. Pro includes 5 recruiter seats, Scale 20 — invites beyond the cap are blocked automatically.",
  },
  {
    q: "Do I need to reformat our CVs?",
    a: "No. Paste them as they are — the semantic search works on real, messy text, and gets sharper as debriefs accumulate.",
  },
  {
    q: "What happens on the Free plan?",
    a: "A full working desk with one open job and up to 25 candidates. Upgrade when you want the AI and unlimited volume.",
  },
];

export const PLANS = [
  {
    name: "Free",
    price: "$0",
    blurb: "Run one live search",
    features: [
      "1 open job",
      "Up to 25 candidates",
      "Pipeline board with drift flags",
      "Interview debriefs",
    ],
  },
  {
    name: "Pro",
    price: "$39",
    blurb: "The full desk, with the AI",
    features: [
      "Unlimited jobs & candidates",
      "AI Talent Agent",
      "One-button candidate sourcing",
      "Semantic search over CVs & debriefs",
      "5 recruiter seats",
    ],
    highlight: true,
  },
  {
    name: "Scale",
    price: "$99",
    blurb: "For bigger agencies",
    features: ["Everything in Pro", "20 recruiter seats", "Priority support"],
  },
] as const;

export const STEPS = [
  {
    n: "01",
    t: "Load your pool",
    b: "Clients, roles, candidates. Paste CVs as they are — debriefs become searchable memory.",
  },
  {
    n: "02",
    t: "Ask in plain English",
    b: "Structure and meaning read together. The answer is a person, linked.",
  },
  {
    n: "03",
    t: "Place faster",
    b: "One click to pipeline. Drift gets flagged before searches go cold.",
  },
];

export const USE_CASES = [
  {
    t: "Permanent",
    b: "Long pipelines, many clients. Nothing slips between stages.",
  },
  {
    t: "Contract",
    b: "Availability and notice periods, answerable in one question.",
  },
  {
    t: "Executive search",
    b: "Years of confidential debriefs become your edge on the next mandate.",
  },
  {
    t: "Embedded & in-house",
    b: "One workspace per team, seats enforced automatically.",
  },
];

export const TRUST_ITEMS = [
  {
    t: "Your data stays yours",
    b: "Every workspace is isolated by design — the AI can only ever see your agency's records, enforced at the query layer.",
  },
  {
    t: "Answers cite their sources",
    b: "Every claim links back to the CV or debrief it came from. No black boxes, no invented candidates.",
  },
  {
    t: "People decide, not models",
    b: "The agent retrieves, summarises and acts on your instruction. It never scores, ranks out, or rejects anyone.",
  },
];

export const SOURCING_ROWS = [
  { pct: 94, name: "Priya Raghavan", note: "Senior React · fintech" },
  { pct: 88, name: "Nadia Hussain", note: "Senior React engineer" },
  { pct: 81, name: "Henrik Dahl", note: "Frontend · web perf" },
];
