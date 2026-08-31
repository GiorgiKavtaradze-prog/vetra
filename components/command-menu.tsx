"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Building2,
  Columns3,
  CreditCard,
  LayoutDashboard,
  Plus,
  Search,
  Users,
  UsersRound,
} from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { InitialsChip } from "@/components/initials-chip";

export type CommandEntities = {
  candidates: {
    _id: string;
    name: string;
    headline: string | null;
    avatarUrl: string | null;
  }[];
  jobs: { _id: string; title: string; companyName: string | null }[];
  companies: { _id: string; name: string }[];
};

const NAV = [
  { href: "/dashboard", label: "Today", icon: LayoutDashboard },
  { href: "/dashboard/pipeline", label: "Pipeline", icon: Columns3 },
  { href: "/dashboard/companies", label: "Companies", icon: Building2 },
  { href: "/dashboard/jobs", label: "Jobs", icon: Briefcase },
  { href: "/dashboard/candidates", label: "Candidates", icon: Users },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/org", label: "Team", icon: UsersRound },
] as const;

const CREATE = [
  { href: "/dashboard/candidates/new", label: "Add candidate" },
  { href: "/dashboard/jobs/new", label: "Add job" },
  { href: "/dashboard/companies/new", label: "Add company" },
] as const;

export function CommandMenu({ entities }: { entities: CommandEntities }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((current) => !current);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-muted-foreground hover:bg-foreground/4 hover:text-foreground mb-1 flex h-7.5 w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 text-[13px] transition-colors"
      >
        <Search className="size-4 shrink-0 opacity-70" />
        Search
        <kbd className="text-muted-foreground/70 ml-auto font-mono text-[10px]">
          ⌘K
        </kbd>
      </button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        className="sm:max-w-2xl"
      >
        <Command>
          <CommandInput placeholder="Search candidates, jobs, companies…" />
          <CommandList>
            <CommandEmpty>No results.</CommandEmpty>
            <CommandGroup heading="Candidates">
              {entities.candidates.map((candidate) => (
                <CommandItem
                  key={candidate._id}
                  value={`candidate ${candidate.name} ${candidate.headline ?? ""}`}
                  onSelect={() => go(`/dashboard/candidates/${candidate._id}`)}
                >
                  <InitialsChip
                    name={candidate.name}
                    src={candidate.avatarUrl}
                    size="sm"
                  />
                  <span className="shrink-0 font-medium">{candidate.name}</span>
                  {candidate.headline ? (
                    <CommandShortcut className="min-w-0 shrink truncate pl-6 tracking-normal">
                      {candidate.headline}
                    </CommandShortcut>
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Jobs">
              {entities.jobs.map((job) => (
                <CommandItem
                  key={job._id}
                  value={`job ${job.title} ${job.companyName ?? ""}`}
                  onSelect={() => go(`/dashboard/jobs/${job._id}`)}
                >
                  <Briefcase className="text-muted-foreground size-4 shrink-0" />
                  <span className="shrink-0 font-medium">{job.title}</span>
                  {job.companyName ? (
                    <CommandShortcut className="min-w-0 shrink truncate pl-6 tracking-normal">
                      {job.companyName}
                    </CommandShortcut>
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Companies">
              {entities.companies.map((company) => (
                <CommandItem
                  key={company._id}
                  value={`company ${company.name}`}
                  onSelect={() => go(`/dashboard/companies/${company._id}`)}
                >
                  <Building2 className="text-muted-foreground size-4" />
                  <span className="truncate">{company.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Go to">
              {NAV.map((item) => (
                <CommandItem
                  key={item.href}
                  value={`go ${item.label}`}
                  onSelect={() => go(item.href)}
                >
                  <item.icon className="text-muted-foreground size-4" />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Create">
              {CREATE.map((item) => (
                <CommandItem
                  key={item.href}
                  value={`create ${item.label}`}
                  onSelect={() => go(item.href)}
                >
                  <Plus className="text-muted-foreground size-4" />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
