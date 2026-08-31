"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

export type CompanyFormValues = {
  name?: string;
  website?: string;
  industry?: string;
  notes?: string;
};

type FormState = { error: string; values: CompanyFormValues } | null;

function fieldValue(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}

function SubmitButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? <Spinner /> : null}
      {pending ? pendingLabel : label}
    </Button>
  );
}

export function CompanyForm({
  action,
  defaultValues,
  submitLabel = "Add company",
  pendingLabel = "Adding…",
  cancelHref = "/dashboard/companies",
}: {
  action: (formData: FormData) => Promise<{ error: string } | void>;
  defaultValues?: CompanyFormValues;
  submitLabel?: string;
  pendingLabel?: string;
  cancelHref?: string;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(
    async (_prev, formData) => {
      const result = await action(formData);
      if (result && "error" in result) {
        // Keep what was typed so an error doesn't wipe the form.
        return {
          error: result.error,
          values: {
            name: fieldValue(formData, "name"),
            website: fieldValue(formData, "website"),
            industry: fieldValue(formData, "industry"),
            notes: fieldValue(formData, "notes"),
          },
        };
      }
      return null;
    },
    null,
  );

  const values = state?.values ?? defaultValues;

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-8">
      {/* Company */}
      <fieldset className="flex flex-col gap-4">
        <legend className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
          Company
        </legend>
        <div className="grid gap-2">
          <Label htmlFor="company-name">Name</Label>
          <Input
            id="company-name"
            name="name"
            required
            defaultValue={values?.name}
            placeholder="Acme Ltd"
            autoComplete="off"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="company-website">Website</Label>
            <Input
              id="company-website"
              name="website"
              type="text"
              inputMode="url"
              defaultValue={values?.website}
              placeholder="acme.com"
              autoComplete="off"
            />
            <p className="text-muted-foreground text-xs">
              We add https:// if you leave it off.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="company-industry">Industry</Label>
            <Input
              id="company-industry"
              name="industry"
              defaultValue={values?.industry}
              placeholder="Fintech"
              autoComplete="off"
            />
          </div>
        </div>
      </fieldset>

      {/* Context */}
      <fieldset className="flex flex-col gap-4">
        <legend className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
          Context
        </legend>
        <div className="grid gap-2">
          <Label htmlFor="company-notes">Notes</Label>
          <Textarea
            id="company-notes"
            name="notes"
            className="min-h-32"
            defaultValue={values?.notes}
            placeholder="Hiring context, key contacts, terms."
          />
          <p className="text-muted-foreground text-xs">
            Anything the desk should know before working this client.
          </p>
        </div>
      </fieldset>

      {/* Footer */}
      <div className="flex flex-col gap-3 border-t pt-5">
        {state?.error && (
          <p className="text-destructive text-sm" role="alert">
            {state.error}
          </p>
        )}
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href={cancelHref} />}
          >
            Cancel
          </Button>
          <SubmitButton label={submitLabel} pendingLabel={pendingLabel} />
        </div>
      </div>
    </form>
  );
}
