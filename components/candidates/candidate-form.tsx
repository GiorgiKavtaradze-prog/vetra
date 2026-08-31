"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createCandidate,
  type CreateCandidateInput,
  type CreateCandidateResult,
  type UpdateCandidateResult,
} from "@/lib/actions/candidates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const SOURCE_OPTIONS = [
  { value: "referral", label: "Referral" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "job-board", label: "Job board" },
  { value: "outreach", label: "Outreach" },
  { value: "other", label: "Other" },
] as const;

export type CandidateFormDefaults = {
  name?: string;
  email?: string;
  headline?: string;
  skills?: string[];
  cvText?: string;
  source?: string;
};

type CandidateFormProps = {
  /** Prefills the fields — pass the candidate doc's values when editing. */
  defaultValues?: CandidateFormDefaults;
  /** Server action the form submits to. Defaults to createCandidate. */
  submitAction?: (
    input: CreateCandidateInput,
  ) => Promise<CreateCandidateResult | UpdateCandidateResult>;
  submitLabel?: string;
  pendingLabel?: string;
  cancelHref?: string;
  /** Where to go after success. Defaults to the created candidate's page. */
  successHref?: string;
};

export function CandidateForm({
  defaultValues,
  submitAction,
  submitLabel = "Add candidate",
  pendingLabel = "Adding…",
  cancelHref = "/dashboard/candidates",
  successHref,
}: CandidateFormProps) {
  const router = useRouter();
  const [source, setSource] = React.useState<string | null>(
    defaultValues?.source ?? null,
  );
  const [error, setError] = React.useState<{
    message: string;
    limitReached: boolean;
  } | null>(null);
  const [isPending, startTransition] = React.useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const submit = submitAction ?? createCandidate;

    startTransition(async () => {
      const result = await submit({
        name: String(data.get("name") ?? ""),
        email: String(data.get("email") ?? ""),
        headline: String(data.get("headline") ?? ""),
        skills: String(data.get("skills") ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        cvText: String(data.get("cvText") ?? ""),
        source: source ?? undefined,
      });

      if ("error" in result && result.error) {
        setError({
          message: result.error,
          limitReached:
            "limitReached" in result && Boolean(result.limitReached),
        });
        return;
      }

      setError(null);
      router.push(
        successHref ??
          ("id" in result && result.id
            ? `/dashboard/candidates/${result.id}`
            : "/dashboard/candidates"),
      );
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* Person */}
      <fieldset className="flex flex-col gap-4">
        <legend className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
          Person
        </legend>
        <div className="grid gap-2">
          <Label htmlFor="candidate-name">Name</Label>
          <Input
            id="candidate-name"
            name="name"
            required
            autoComplete="off"
            defaultValue={defaultValues?.name}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="candidate-email">Email</Label>
            <Input
              id="candidate-email"
              name="email"
              type="email"
              autoComplete="off"
              defaultValue={defaultValues?.email}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="candidate-source">Source</Label>
            <Select value={source} onValueChange={(value) => setSource(value)}>
              <SelectTrigger id="candidate-source" className="w-full">
                <SelectValue placeholder="Select a source" />
              </SelectTrigger>
              <SelectContent>
                {SOURCE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </fieldset>

      {/* Profile */}
      <fieldset className="flex flex-col gap-4">
        <legend className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
          Profile
        </legend>
        <div className="grid gap-2">
          <Label htmlFor="candidate-headline">Headline</Label>
          <Input
            id="candidate-headline"
            name="headline"
            placeholder="Senior React engineer, fintech"
            defaultValue={defaultValues?.headline}
          />
          <p className="text-muted-foreground text-xs">
            One line that sells them — it shows everywhere their name does.
          </p>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="candidate-skills">Skills</Label>
          <Input
            id="candidate-skills"
            name="skills"
            placeholder="React, TypeScript, GraphQL"
            defaultValue={defaultValues?.skills?.join(", ")}
          />
          <p className="text-muted-foreground text-xs">
            Separate skills with commas.
          </p>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="candidate-cv">CV / profile</Label>
          <Textarea
            id="candidate-cv"
            name="cvText"
            className="min-h-64"
            placeholder="Paste the full CV or profile text."
            defaultValue={defaultValues?.cvText}
          />
          <p className="text-muted-foreground text-xs">
            The richer this is, the better the AI matches — paste everything.
          </p>
        </div>
      </fieldset>

      {error && (
        <p className="text-destructive text-sm" role="alert">
          {error.message}{" "}
          {error.limitReached && (
            <Link
              href="/dashboard/billing"
              className="font-medium underline underline-offset-2"
            >
              Go to billing
            </Link>
          )}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 border-t pt-5">
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href={cancelHref} />}
        >
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? <Spinner /> : null}
          {isPending ? pendingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
