"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createJob } from "@/lib/actions/jobs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SENIORITY_ITEMS = [
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid" },
  { value: "senior", label: "Senior" },
  { value: "staff", label: "Staff" },
  { value: "lead", label: "Lead" },
  { value: "executive", label: "Executive" },
] as const;

type FormError = { message: string; upgrade?: boolean };

type JobFormDefaults = {
  title: string;
  companyId: string | null;
  seniority: string | null;
  salaryRange: string | null;
  description: string | null;
};

export function JobForm({
  companies,
  defaultValues,
  submitAction,
  cancelHref = "/dashboard/jobs",
  redirectTo = "/dashboard/jobs",
}: {
  companies: { _id: string; name: string }[];
  defaultValues?: JobFormDefaults;
  submitAction?: (
    formData: FormData,
  ) => Promise<{ ok: true } | { error: string; upgrade?: boolean }>;
  cancelHref?: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<FormError | null>(null);
  const [pending, startTransition] = useTransition();

  const isEdit = defaultValues !== undefined;
  const submit = submitAction ?? createJob;

  const companyItems = companies.map((company) => ({
    value: company._id,
    label: company.name,
  }));

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await submit(formData);
      if ("error" in result) {
        setError({ message: result.error, upgrade: result.upgrade });
      } else {
        setError(null);
        router.push(redirectTo);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* The role */}
      <section className="flex flex-col gap-4">
        <p className="text-muted-foreground text-xs font-medium">The role</p>

        <div className="flex flex-col gap-2">
          <Label htmlFor="job-title">Title</Label>
          <Input
            id="job-title"
            name="title"
            placeholder="Senior product engineer"
            defaultValue={defaultValues?.title}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="job-company">Client company</Label>
          {companies.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No companies yet —{" "}
              <Link
                href="/dashboard/companies"
                className="text-foreground font-medium underline underline-offset-2"
              >
                add a client
              </Link>{" "}
              on the Companies page first.
            </p>
          ) : (
            <Select
              name="companyId"
              items={companyItems}
              defaultValue={defaultValues?.companyId ?? undefined}
            >
              <SelectTrigger id="job-company" className="w-full">
                <SelectValue placeholder="Choose a company" />
              </SelectTrigger>
              <SelectContent>
                {companyItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </section>

      {/* Details */}
      <section className="flex flex-col gap-4">
        <p className="text-muted-foreground text-xs font-medium">Details</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="job-seniority">Seniority</Label>
            <Select
              name="seniority"
              items={[...SENIORITY_ITEMS]}
              defaultValue={defaultValues?.seniority ?? undefined}
            >
              <SelectTrigger id="job-seniority" className="w-full">
                <SelectValue placeholder="Choose" />
              </SelectTrigger>
              <SelectContent>
                {SENIORITY_ITEMS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="job-salary">Salary range</Label>
            <Input
              id="job-salary"
              name="salaryRange"
              placeholder="60k to 80k"
              defaultValue={defaultValues?.salaryRange ?? undefined}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="job-description">Description</Label>
          <Textarea
            id="job-description"
            name="description"
            className="min-h-48"
            placeholder="What the role involves and who you are looking for."
            defaultValue={defaultValues?.description ?? undefined}
          />
          <p className="text-muted-foreground text-xs">
            Candidate sourcing matches CVs against this description — the more
            specific it is, the better the shortlist.
          </p>
        </div>
      </section>

      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error.message}{" "}
          {error.upgrade ? (
            <Link
              href="/dashboard/billing"
              className="font-medium underline underline-offset-2"
            >
              Upgrade your plan
            </Link>
          ) : null}
        </p>
      ) : null}

      <div className="flex items-center justify-end gap-2 border-t pt-5">
        <Button
          size="sm"
          variant="outline"
          nativeButton={false}
          render={<Link href={cancelHref} />}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          type="submit"
          disabled={pending || (!isEdit && companies.length === 0)}
        >
          {pending ? <Spinner /> : null}
          {pending
            ? isEdit
              ? "Saving…"
              : "Adding job…"
            : isEdit
              ? "Save changes"
              : "Add job"}
        </Button>
      </div>
    </form>
  );
}
