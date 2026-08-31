import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { CandidateForm } from "@/components/candidates/candidate-form";
import { PageHeader } from "@/components/shell/panels";
import { requireOrg } from "@/lib/tenant";

export default async function NewCandidatePage() {
  await requireOrg();

  return (
    <div className="flex flex-col pb-6">
      <Link
        href="/dashboard/candidates"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 self-start pt-5 text-[13px] transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        Back to candidates
      </Link>
      <PageHeader
        title="Add candidate"
        description="A person joins your pool once — every search after that can find them."
      />

      <div className="mt-4 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 max-w-2xl">
          <CandidateForm />
        </div>

        {/* AI aside — violet because it describes the intelligent part */}
        <aside className="lg:sticky lg:top-6 lg:border-l lg:pl-6">
          <p className="text-ai flex items-center gap-1.5 text-xs font-medium">
            <Sparkles className="size-3.5" aria-hidden="true" />
            AI matching
          </p>
          <p className="mt-2 text-[13px] leading-relaxed">
            The CV / profile field is what the AI reads. Sourcing scores it
            against every open role, and the Talent Agent searches it
            semantically — &quot;strong system design&quot; finds people whose
            CVs say it in other words.
          </p>
          <p className="text-muted-foreground mt-2 text-[13px] leading-relaxed">
            Paste the whole thing. Skills and headlines help humans skim; the
            CV text is what gets this candidate found again.
          </p>
        </aside>
      </div>
    </div>
  );
}
