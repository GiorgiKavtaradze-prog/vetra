import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { requireOrg } from "@/lib/tenant";
import { readClient } from "@/lib/sanity/client";
import { updateJob } from "@/lib/actions/jobs";
import { JobForm } from "@/components/kanban/job-form";
import { StageMixBar } from "@/components/stage-mix-bar";
import { Section } from "@/components/shell/panels";
import type { Stage } from "@/sanity/schemas/stages";

type JobEditDetail = {
  _id: string;
  title: string;
  seniority: string | null;
  salaryRange: string | null;
  description: string | null;
  companyId: string | null;
  stages: Stage[];
};

const JOB_EDIT_QUERY = `*[_type == "job" && _id == $id && orgId == $orgId][0]{
  _id,
  title,
  seniority,
  salaryRange,
  description,
  "companyId": company->_id,
  "stages": *[_type == "application" && orgId == $orgId && job._ref == ^._id].stage
}`;

const COMPANIES_QUERY = `*[_type == "company" && orgId == $orgId] | order(name asc) { _id, name }`;

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { orgId } = await requireOrg();

  const [job, companies] = await Promise.all([
    readClient.fetch<JobEditDetail | null>(JOB_EDIT_QUERY, { id, orgId }),
    readClient.fetch<{ _id: string; name: string }[]>(COMPANIES_QUERY, {
      orgId,
    }),
  ]);

  if (!job) notFound();

  const stageCounts: Partial<Record<Stage, number>> = {};
  for (const stage of job.stages) {
    stageCounts[stage] = (stageCounts[stage] ?? 0) + 1;
  }
  const applicationCount = job.stages.length;

  return (
    <div className="flex flex-col pb-6">
      <div className="pt-5">
        <Link
          href={`/dashboard/jobs/${job._id}`}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-[13px] transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to {job.title}
        </Link>
        <h1 className="mt-4 text-lg font-semibold tracking-tight sm:text-xl">
          Edit job
        </h1>
        <p className="text-muted-foreground mt-1 text-[13px] sm:text-sm">
          Update the role — changes apply across the pipeline right away.
        </p>
        <div className="text-muted-foreground/80 mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px]">
          <StageMixBar counts={stageCounts} className="w-40" />
          <span className="font-mono text-xs tabular-nums whitespace-nowrap">
            {applicationCount}{" "}
            {applicationCount === 1 ? "application" : "applications"}
          </span>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 max-w-2xl">
          <JobForm
            companies={companies}
            defaultValues={{
              title: job.title,
              companyId: job.companyId,
              seniority: job.seniority,
              salaryRange: job.salaryRange,
              description: job.description,
            }}
            submitAction={updateJob.bind(null, job._id)}
            cancelHref={`/dashboard/jobs/${job._id}`}
            redirectTo={`/dashboard/jobs/${job._id}`}
          />
        </div>

        <aside className="lg:border-l lg:pl-6">
          <Section title="Editing a live role">
            <div className="text-muted-foreground space-y-3 text-[13px] leading-relaxed">
              <p>
                Edits apply to the live pipeline immediately — candidates keep
                their stages.
              </p>
              <p>
                A sharper description also sharpens AI sourcing, which matches
                CVs against this text.
              </p>
            </div>
          </Section>
        </aside>
      </div>
    </div>
  );
}
