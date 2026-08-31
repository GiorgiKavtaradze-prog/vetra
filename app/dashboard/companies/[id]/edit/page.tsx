import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { requireOrg } from "@/lib/tenant";
import { readClient } from "@/lib/sanity/client";
import { InitialsChip } from "@/components/initials-chip";
import { EditCompanyForm } from "@/components/companies/edit-company-form";
import { Section } from "@/components/shell/panels";

type CompanyDoc = {
  _id: string;
  name: string;
  website?: string;
  industry?: string;
  notes?: string;
};

const COMPANY_QUERY = `*[_type == "company" && _id == $id && orgId == $orgId][0]{
  _id, name, website, industry, notes
}`;

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { orgId } = await requireOrg();
  const { id } = await params;

  const company = await readClient.fetch<CompanyDoc | null>(COMPANY_QUERY, {
    id,
    orgId,
  });

  if (!company) notFound();

  return (
    <div className="flex flex-col pb-6">
      <div className="pt-5">
        <Link
          href={`/dashboard/companies/${company._id}`}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-[13px] transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to {company.name}
        </Link>
        <div className="mt-4 flex items-center gap-4">
          <InitialsChip name={company.name} size="lg" />
          <div className="min-w-0">
            <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
              Edit company
            </h1>
            <p className="text-muted-foreground mt-1 text-[13px] sm:text-sm">
              Update {company.name}&apos;s details. Changes apply across every
              job and pipeline.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 max-w-2xl">
          <EditCompanyForm
            id={company._id}
            defaultValues={{
              name: company.name,
              website: company.website,
              industry: company.industry,
              notes: company.notes,
            }}
          />
        </div>

        <aside className="lg:border-l lg:pl-6">
          <Section title="What changes here">
            <div className="text-muted-foreground space-y-3 text-[13px] leading-relaxed">
              <p>
                Edits apply everywhere {company.name} appears — job cards,
                pipelines, and the client list pick them up right away.
              </p>
              <p>
                Renaming is safe: jobs and applications stay attached to the
                same client record.
              </p>
            </div>
          </Section>
        </aside>
      </div>
    </div>
  );
}
