import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { requireOrg } from "@/lib/tenant";
import { readClient } from "@/lib/sanity/client";
import { updateCandidate } from "@/lib/actions/candidates";
import { InitialsChip } from "@/components/initials-chip";
import { CandidateForm } from "@/components/candidates/candidate-form";
import { Section } from "@/components/shell/panels";

type CandidateDoc = {
  _id: string;
  name: string;
  email?: string;
  headline?: string;
  skills?: string[];
  cvText?: string;
  source?: string;
};

export default async function EditCandidatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { orgId } = await requireOrg();
  const { id } = await params;

  const candidate = await readClient.fetch<CandidateDoc | null>(
    `*[_type == "candidate" && _id == $id && orgId == $orgId][0]{
      _id, name, email, headline, skills, cvText, source
    }`,
    { id, orgId },
  );

  if (!candidate) notFound();

  return (
    <div className="flex flex-col pb-6">
      <div className="pt-5">
        <Link
          href={`/dashboard/candidates/${candidate._id}`}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-[13px] transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to {candidate.name}
        </Link>
        <div className="mt-4 flex items-center gap-4">
          <InitialsChip name={candidate.name} size="lg" />
          <div className="min-w-0">
            <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
              Edit candidate
            </h1>
            <p className="text-muted-foreground mt-1 text-[13px] sm:text-sm">
              Changes apply everywhere this candidate appears — searches,
              matches, and applications.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 max-w-2xl">
          <CandidateForm
            defaultValues={{
              name: candidate.name,
              email: candidate.email,
              headline: candidate.headline,
              skills: candidate.skills,
              cvText: candidate.cvText,
              source: candidate.source,
            }}
            submitAction={updateCandidate.bind(null, candidate._id)}
            submitLabel="Save changes"
            pendingLabel="Saving…"
            cancelHref={`/dashboard/candidates/${candidate._id}`}
            successHref={`/dashboard/candidates/${candidate._id}`}
          />
        </div>

        <aside className="lg:border-l lg:pl-6">
          <Section title="Keep the CV current">
            <div className="text-muted-foreground space-y-3 text-[13px] leading-relaxed">
              <p>
                Changes land everywhere this person appears — searches, sourcing
                matches, and live applications.
              </p>
              <p>
                The CV text is what AI matching reads. Paste the newest version
                whenever you get one.
              </p>
            </div>
          </Section>
        </aside>
      </div>
    </div>
  );
}
