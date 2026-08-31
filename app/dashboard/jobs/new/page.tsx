import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireOrg } from "@/lib/tenant";
import { readClient } from "@/lib/sanity/client";
import { JobForm } from "@/components/kanban/job-form";
import { PageHeader, Section } from "@/components/shell/panels";

const COMPANIES_QUERY = `*[_type == "company" && orgId == $orgId] | order(name asc) { _id, name }`;

export default async function NewJobPage() {
  const { orgId } = await requireOrg();

  const companies = await readClient.fetch<{ _id: string; name: string }[]>(
    COMPANIES_QUERY,
    { orgId },
  );

  return (
    <div className="flex flex-col pb-6">
      <Link
        href="/dashboard/jobs"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 self-start pt-5 text-[13px] transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        Back to jobs
      </Link>
      <PageHeader
        title="Add job"
        description="Open a role for one of your client companies."
      />

      <div className="mt-4 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 max-w-2xl">
          <JobForm companies={companies} />
        </div>

        <aside className="lg:border-l lg:pl-6">
          <Section title="Writing the role">
            <div className="text-muted-foreground space-y-3 text-[13px] leading-relaxed">
              <p>
                The description does double duty: it briefs the desk, and it is
                the text AI sourcing matches CVs against — specifics beat
                adjectives.
              </p>
              <p>
                Seniority and a salary range keep the jobs grid scannable once
                the desk gets busy.
              </p>
            </div>
          </Section>
        </aside>
      </div>
    </div>
  );
}
