import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CreateOrganization } from "@clerk/nextjs";

export default async function OnboardingPage() {
  const { userId, orgId } = await auth();
  if (!userId) redirect("/sign-in");
  if (orgId) redirect("/dashboard");

  return (
    <main className="flex flex-1 flex-col">
      {/* Dark band — the brand world from the landing */}
      <div className="grain relative overflow-hidden bg-[#131120] px-6 pt-16 pb-32 text-center text-white">
        <div
          aria-hidden
          className="absolute -top-28 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(124,92,214,0.4),transparent_65%)] blur-3xl"
        />
        <div className="relative z-10 flex flex-col items-center">
          <span className="font-display text-lg font-bold tracking-tight">
            Vetra<span className="text-[#9F8BEF]">.</span>
          </span>
          <p className="mt-6 font-mono text-xs tracking-[0.25em] text-[#9F8BEF] uppercase">
            One-time setup
          </p>
          <h1 className="font-display mt-3 text-3xl font-bold tracking-tight">
            Set up your agency
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-white/60">
            Every client, job and candidate lives under your agency&apos;s
            workspace. Create it once — invite your recruiters later.
          </p>
        </div>
      </div>

      {/* Clerk card overlaps the seam */}
      <div className="relative z-10 -mt-16 flex flex-1 flex-col items-center px-6 pb-16">
        <CreateOrganization afterCreateOrganizationUrl="/dashboard" />
      </div>
    </main>
  );
}
