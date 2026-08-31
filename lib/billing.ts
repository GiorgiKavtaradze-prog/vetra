import "server-only";

export type BillingPlan = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  monthlyCents: number;
  annualMonthlyCents: number;
  currencySymbol: string;
  features: { slug: string; name: string }[];
};

type RawPlan = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  fee?: { amount?: number; currency_symbol?: string };
  annual_monthly_fee?: { amount?: number };
  for_payer_type?: string;
  publicly_visible?: boolean;
  features?: { slug?: string; name?: string }[];
};

export async function fetchOrgPlans(): Promise<BillingPlan[]> {
  const res = await fetch("https://api.clerk.com/v1/billing/plans", {
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`Billing plans fetch failed: ${res.status}`);
  const json = await res.json();
  const raw: RawPlan[] = Array.isArray(json) ? json : (json.data ?? []);

  return raw
    .filter((p) => p.for_payer_type === "org" && p.publicly_visible !== false)
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description ?? null,
      monthlyCents: p.fee?.amount ?? 0,
      annualMonthlyCents: p.annual_monthly_fee?.amount ?? p.fee?.amount ?? 0,
      currencySymbol: p.fee?.currency_symbol ?? "$",
      features: (p.features ?? []).flatMap((f) =>
        f.slug && f.name ? [{ slug: f.slug, name: f.name }] : [],
      ),
    }))
    .sort((a, b) => a.monthlyCents - b.monthlyCents);
}
