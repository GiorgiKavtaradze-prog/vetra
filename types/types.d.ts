export type Plan = {
  name: string;
  price: string;
  blurb: string;
  features: readonly string[];
  highlight?: boolean;
};

export type Step = {
  n: string;
  t: string;
  b: string;
};

export type UseCase = {
  t: string;
  b: string;
};

export type TrustItem = {
  t: string;
  b: string;
};

export type SourcingRow = {
  pct: number;
  name: string;
  note: string;
};

export type Faq = {
  q: string;
  a: string;
};

export type Query = string;
