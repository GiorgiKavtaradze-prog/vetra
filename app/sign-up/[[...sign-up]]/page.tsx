import Link from "next/link";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Dark band — the brand world from the landing */}
      <div className="grain relative overflow-hidden bg-[#131120] px-6 pt-16 pb-28 text-center text-white">
        <div
          aria-hidden
          className="absolute -top-28 left-1/2 h-72 w-xl -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(124,92,214,0.4),transparent_65%)] blur-3xl"
        />
        <div className="relative z-10">
          <Link
            href="/"
            className="font-display text-2xl font-bold tracking-tight"
          >
            Vetra<span className="text-[#9F8BEF]">.</span>
          </Link>
          <p className="mt-2 text-sm text-white/60">
            Start free — no card needed.
          </p>
        </div>
      </div>

      {/* Clerk card overlaps the seam */}
      <div className="relative z-10 -mt-14 flex flex-1 flex-col items-center px-6 pb-16">
        <SignUp />
      </div>
    </main>
  );
}
