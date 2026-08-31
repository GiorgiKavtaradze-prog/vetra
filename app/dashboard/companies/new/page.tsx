import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { createCompany } from "@/lib/actions/companies";
import { CompanyForm } from "@/components/companies/company-form";
import { PageHeader, Section } from "@/components/shell/panels";
import { requireOrg } from "@/lib/tenant";

async function createCompanyAndReturn(formData: FormData) {
  "use server";
  await createCompany(formData);
  redirect("/dashboard/companies");
}

export default async function NewCompanyPage() {
  await requireOrg();

  return (
    <div className="flex flex-col pb-6">
      <Link
        href="/dashboard/companies"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 self-start pt-5 text-[13px] transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        Back to companies
      </Link>
      <PageHeader
        title="Add company"
        description="A client company your agency recruits for. You can open jobs against it right after."
      />

      <div className="mt-4 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 max-w-2xl">
          <CompanyForm action={createCompanyAndReturn} />
        </div>

        <aside className="lg:border-l lg:pl-6">
          <Section title="Good client records">
            <div className="text-muted-foreground space-y-3 text-[13px] leading-relaxed">
              <p>
                The website powers the external link on your client list, and
                the industry keeps long lists scannable.
              </p>
              <p>
                Notes are internal — terms, key contacts, anything the whole
                desk should know before a call.
              </p>
            </div>
          </Section>
        </aside>
      </div>
    </div>
  );
}
